-- Read-only audit filtering/pagination; compatible with previous app versions.
CREATE INDEX IF NOT EXISTS audit_dataset_level_id
ON audit(dataset_id, json_extract(payload, '$.level'), id);
