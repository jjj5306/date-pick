create table if not exists pending_writes (
  id text primary key,
  user_id text not null,
  channel_id text not null,
  action text not null,
  payload_json text not null,
  expires_at text not null,
  created_at text not null
);
