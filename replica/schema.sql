-- Crack UML initial domain schema
-- PostgreSQL / Neon. Auth.js adapter tables are added separately.

create extension if not exists pgcrypto;

create type workspace_kind as enum ('personal', 'classroom', 'team');
create type workspace_role as enum ('owner', 'editor', 'commenter', 'viewer');
create type project_visibility as enum ('private', 'workspace', 'public_link');
create type export_format as enum ('svg', 'png', 'jpeg', 'pdf', 'html', 'fragment');
create type export_status as enum ('queued', 'running', 'complete', 'failed', 'expired');
create type comment_status as enum ('open', 'resolved');

create table users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text not null unique,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) between 1 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  kind workspace_kind not null default 'personal',
  created_by uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table workspace_members (
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  role workspace_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index workspace_members_user_idx on workspace_members(user_id, workspace_id);

create table workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  invited_by uuid not null references users(id) on delete restrict,
  email text not null,
  role workspace_role not null default 'viewer',
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (role <> 'owner')
);

create index workspace_invites_workspace_idx on workspace_invites(workspace_id, expires_at);
create index workspace_invites_email_idx on workspace_invites(lower(email));

create table projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  created_by uuid not null references users(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 160),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{1,90}$'),
  format_version integer not null default 1 check (format_version > 0),
  visibility project_visibility not null default 'private',
  revision integer not null default 0 check (revision >= 0),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create index projects_workspace_idx on projects(workspace_id, updated_at desc);
create index projects_created_by_idx on projects(created_by);

create table lesson_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) on delete cascade,
  created_by uuid references users(id) on delete set null,
  slug text not null,
  title text not null check (length(trim(title)) between 1 and 160),
  description text not null default '',
  starter_document jsonb not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);

create index lesson_templates_published_idx on lesson_templates(is_published, updated_at desc);

create table project_lessons (
  project_id uuid not null references projects(id) on delete cascade,
  lesson_template_id uuid not null references lesson_templates(id) on delete restrict,
  assigned_by uuid references users(id) on delete set null,
  progress jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (project_id, lesson_template_id)
);

create index project_lessons_template_idx on project_lessons(lesson_template_id);

create table model_packages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  parent_id uuid references model_packages(id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 160),
  documentation text not null default '',
  sort_order integer not null default 0,
  created_by uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (parent_id is null or parent_id <> id)
);

create index model_packages_project_idx on model_packages(project_id, parent_id, sort_order);
create index model_packages_parent_idx on model_packages(parent_id);

create table model_elements (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  package_id uuid references model_packages(id) on delete set null,
  kind text not null check (kind ~ '^[A-Za-z][A-Za-z0-9_.-]{1,80}$'),
  name text not null check (length(trim(name)) between 1 and 200),
  visibility text not null default 'public'
    check (visibility in ('public', 'protected', 'private', 'package', 'unspecified')),
  stereotype text,
  properties jsonb not null default '{}'::jsonb,
  tags jsonb not null default '{}'::jsonb,
  documentation text not null default '',
  created_by uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index model_elements_project_idx on model_elements(project_id, kind, name);
create index model_elements_package_idx on model_elements(package_id, name);

create table model_relationships (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  relationship_type text not null check (relationship_type ~ '^[A-Za-z][A-Za-z0-9_.-]{1,80}$'),
  source_element_id uuid not null references model_elements(id) on delete restrict,
  target_element_id uuid not null references model_elements(id) on delete restrict,
  name text not null default '',
  properties jsonb not null default '{}'::jsonb,
  created_by uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_element_id <> target_element_id)
);

create index model_relationships_project_idx on model_relationships(project_id, relationship_type);
create index model_relationships_source_idx on model_relationships(source_element_id);
create index model_relationships_target_idx on model_relationships(target_element_id);

create table diagrams (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  package_id uuid references model_packages(id) on delete set null,
  name text not null check (length(trim(name)) between 1 and 160),
  diagram_type text not null check (diagram_type ~ '^[A-Za-z][A-Za-z0-9_.-]{1,80}$'),
  settings jsonb not null default '{}'::jsonb,
  documentation text not null default '',
  created_by uuid not null references users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diagrams_project_idx on diagrams(project_id, updated_at desc);
create index diagrams_package_idx on diagrams(package_id, name);

create table diagram_nodes (
  id uuid primary key default gen_random_uuid(),
  diagram_id uuid not null references diagrams(id) on delete cascade,
  model_element_id uuid not null references model_elements(id) on delete restrict,
  x double precision not null default 0 check (x between -100000 and 100000),
  y double precision not null default 0 check (y between -100000 and 100000),
  width double precision not null default 160 check (width between 12 and 10000),
  height double precision not null default 80 check (height between 12 and 10000),
  style jsonb not null default '{}'::jsonb,
  labels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index diagram_nodes_diagram_idx on diagram_nodes(diagram_id);
create index diagram_nodes_model_element_idx on diagram_nodes(model_element_id);

create table diagram_edges (
  id uuid primary key default gen_random_uuid(),
  diagram_id uuid not null references diagrams(id) on delete cascade,
  relationship_id uuid not null references model_relationships(id) on delete restrict,
  source_node_id uuid not null references diagram_nodes(id) on delete restrict,
  target_node_id uuid not null references diagram_nodes(id) on delete restrict,
  points jsonb not null default '[]'::jsonb,
  style jsonb not null default '{}'::jsonb,
  labels jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (source_node_id <> target_node_id)
);

create index diagram_edges_diagram_idx on diagram_edges(diagram_id);
create index diagram_edges_relationship_idx on diagram_edges(relationship_id);
create index diagram_edges_source_idx on diagram_edges(source_node_id);
create index diagram_edges_target_idx on diagram_edges(target_node_id);

create table project_revisions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  revision_no integer not null check (revision_no > 0),
  author_id uuid not null references users(id) on delete restrict,
  change_type text not null default 'edit'
    check (change_type in ('create', 'edit', 'import', 'restore', 'export')),
  summary text not null default '',
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique (project_id, revision_no)
);

create index project_revisions_project_idx on project_revisions(project_id, revision_no desc);
create index project_revisions_author_idx on project_revisions(author_id);

create table comments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  author_id uuid not null references users(id) on delete restrict,
  anchor_type text not null check (anchor_type in ('project', 'diagram', 'model_element', 'diagram_node', 'diagram_edge')),
  anchor_id uuid,
  body text not null check (length(trim(body)) between 1 and 10000),
  status comment_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_project_idx on comments(project_id, created_at desc);
create index comments_anchor_idx on comments(anchor_type, anchor_id);

create table share_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_by uuid not null references users(id) on delete restrict,
  token_hash text not null unique,
  permission text not null default 'view' check (permission = 'view'),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index share_links_project_idx on share_links(project_id, created_at desc);
create index share_links_expiry_idx on share_links(expires_at);

create table export_jobs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  requested_by uuid not null references users(id) on delete restrict,
  format export_format not null,
  selection_query text not null default '@Diagram',
  options jsonb not null default '{}'::jsonb,
  status export_status not null default 'queued',
  output_url text,
  error_code text,
  error_message text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create index export_jobs_project_idx on export_jobs(project_id, created_at desc);
create index export_jobs_queue_idx on export_jobs(status, created_at)
  where status in ('queued', 'running');

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_set_updated_at before update on users
for each row execute function set_updated_at();
create trigger workspaces_set_updated_at before update on workspaces
for each row execute function set_updated_at();
create trigger projects_set_updated_at before update on projects
for each row execute function set_updated_at();
create trigger lesson_templates_set_updated_at before update on lesson_templates
for each row execute function set_updated_at();
create trigger model_packages_set_updated_at before update on model_packages
for each row execute function set_updated_at();
create trigger model_elements_set_updated_at before update on model_elements
for each row execute function set_updated_at();
create trigger model_relationships_set_updated_at before update on model_relationships
for each row execute function set_updated_at();
create trigger diagrams_set_updated_at before update on diagrams
for each row execute function set_updated_at();
create trigger diagram_nodes_set_updated_at before update on diagram_nodes
for each row execute function set_updated_at();
create trigger diagram_edges_set_updated_at before update on diagram_edges
for each row execute function set_updated_at();
create trigger comments_set_updated_at before update on comments
for each row execute function set_updated_at();
