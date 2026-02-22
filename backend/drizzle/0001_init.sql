CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  phone_number TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone_number TEXT NOT NULL UNIQUE,
  device_id INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS campaigns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_time TEXT,
  device_id INTEGER,
  duration_minutes INTEGER,
  time_slot_start TEXT,
  time_slot_end TEXT,
  total_contacts INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(device_id) REFERENCES devices(id)
);

CREATE TABLE IF NOT EXISTS sms_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_id INTEGER,
  contact_id INTEGER,
  device_id INTEGER,
  to_phone TEXT NOT NULL,
  from_phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  provider_message_id TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at TEXT,
  FOREIGN KEY(campaign_id) REFERENCES campaigns(id),
  FOREIGN KEY(contact_id) REFERENCES contacts(id),
  FOREIGN KEY(device_id) REFERENCES devices(id)
);
