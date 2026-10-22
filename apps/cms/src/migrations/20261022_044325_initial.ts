import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`role\` text DEFAULT 'editor',
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`reset_password_requested_at\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_card_url\` text,
  	\`sizes_card_width\` numeric,
  	\`sizes_card_height\` numeric,
  	\`sizes_card_mime_type\` text,
  	\`sizes_card_filesize\` numeric,
  	\`sizes_card_filename\` text,
  	\`sizes_large_url\` text,
  	\`sizes_large_width\` numeric,
  	\`sizes_large_height\` numeric,
  	\`sizes_large_mime_type\` text,
  	\`sizes_large_filesize\` numeric,
  	\`sizes_large_filename\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_card_sizes_card_filename_idx\` ON \`media\` (\`sizes_card_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_large_sizes_large_filename_idx\` ON \`media\` (\`sizes_large_filename\`);`)
  await db.run(sql`CREATE TABLE \`media_locales\` (
  	\`alt\` text NOT NULL,
  	\`caption\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`media_locales_locale_parent_id_unique\` ON \`media_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`media_locales_parent_id_idx\` ON \`media_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`categories_seo_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`keyword\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`categories_seo_keywords_order_idx\` ON \`categories_seo_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`categories_seo_keywords_parent_id_idx\` ON \`categories_seo_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_seo_keywords_locale_idx\` ON \`categories_seo_keywords\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`categories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`parent_id\` integer,
  	\`cover_id\` integer,
  	\`sort\` numeric DEFAULT 10,
  	\`seo_canonical_url\` text,
  	\`seo_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cover_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_slug_idx\` ON \`categories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`categories_parent_idx\` ON \`categories\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_cover_idx\` ON \`categories\` (\`cover_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_seo_seo_image_idx\` ON \`categories\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_updated_at_idx\` ON \`categories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`categories_created_at_idx\` ON \`categories\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`categories_locales\` (
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`categories_locales_locale_parent_id_unique\` ON \`categories_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`categories_locales_parent_id_idx\` ON \`categories_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_tags_order_idx\` ON \`products_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_tags_parent_id_idx\` ON \`products_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_tags_locales\` (
  	\`tag\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_tags_locales_locale_parent_id_unique\` ON \`products_tags_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_tags_locales_parent_id_idx\` ON \`products_tags_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_specs_order_idx\` ON \`products_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_specs_parent_id_idx\` ON \`products_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_specs_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_specs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_specs_locales_locale_parent_id_unique\` ON \`products_specs_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_specs_locales_parent_id_idx\` ON \`products_specs_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_highlights_order_idx\` ON \`products_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_highlights_parent_id_idx\` ON \`products_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_highlights_locales\` (
  	\`title\` text,
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_highlights_locales_locale_parent_id_unique\` ON \`products_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_highlights_locales_parent_id_idx\` ON \`products_highlights_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_variants_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_variants_options_order_idx\` ON \`products_variants_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_variants_options_parent_id_idx\` ON \`products_variants_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_variants_options_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_variants_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_variants_options_locales_locale_parent_id_unique\` ON \`products_variants_options_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_variants_options_locales_parent_id_idx\` ON \`products_variants_options_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_variants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_variants_order_idx\` ON \`products_variants\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_variants_parent_id_idx\` ON \`products_variants\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_variants_locales\` (
  	\`name\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_variants_locales_locale_parent_id_unique\` ON \`products_variants_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_variants_locales_parent_id_idx\` ON \`products_variants_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_rich_text_order_idx\` ON \`products_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_rich_text_parent_id_idx\` ON \`products_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_rich_text_path_idx\` ON \`products_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_rich_text_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_rich_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_rich_text_locales_locale_parent_id_unique\` ON \`products_blocks_rich_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_rich_text_locales_parent_id_idx\` ON \`products_blocks_rich_text_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_position\` text DEFAULT 'left',
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_image_text_order_idx\` ON \`products_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_image_text_parent_id_idx\` ON \`products_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_image_text_path_idx\` ON \`products_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_image_text_image_idx\` ON \`products_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_image_text_locales\` (
  	\`heading\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_image_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_image_text_locales_locale_parent_id_unique\` ON \`products_blocks_image_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_image_text_locales_parent_id_idx\` ON \`products_blocks_image_text_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_spec_table_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_spec_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_spec_table_rows_order_idx\` ON \`products_blocks_spec_table_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_spec_table_rows_parent_id_idx\` ON \`products_blocks_spec_table_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_spec_table_rows_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_spec_table_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_spec_table_rows_locales_locale_parent_id_uni\` ON \`products_blocks_spec_table_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_spec_table_rows_locales_parent_id_idx\` ON \`products_blocks_spec_table_rows_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_spec_table\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_spec_table_order_idx\` ON \`products_blocks_spec_table\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_spec_table_parent_id_idx\` ON \`products_blocks_spec_table\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_spec_table_path_idx\` ON \`products_blocks_spec_table\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_spec_table_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_spec_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_spec_table_locales_locale_parent_id_unique\` ON \`products_blocks_spec_table_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_spec_table_locales_parent_id_idx\` ON \`products_blocks_spec_table_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_size_guide\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_size_guide_order_idx\` ON \`products_blocks_size_guide\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_size_guide_parent_id_idx\` ON \`products_blocks_size_guide\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_size_guide_path_idx\` ON \`products_blocks_size_guide\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_size_guide_image_idx\` ON \`products_blocks_size_guide\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_size_guide_locales\` (
  	\`title\` text,
  	\`notes\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_size_guide\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_size_guide_locales_locale_parent_id_unique\` ON \`products_blocks_size_guide_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_size_guide_locales_parent_id_idx\` ON \`products_blocks_size_guide_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_comparison_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_comparison\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_comparison_items_order_idx\` ON \`products_blocks_comparison_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_comparison_items_parent_id_idx\` ON \`products_blocks_comparison_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_comparison_items_locales\` (
  	\`title\` text,
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_comparison_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_comparison_items_locales_locale_parent_id_un\` ON \`products_blocks_comparison_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_comparison_items_locales_parent_id_idx\` ON \`products_blocks_comparison_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_comparison\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_comparison_order_idx\` ON \`products_blocks_comparison\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_comparison_parent_id_idx\` ON \`products_blocks_comparison\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_comparison_path_idx\` ON \`products_blocks_comparison\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_comparison_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_comparison\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_comparison_locales_locale_parent_id_unique\` ON \`products_blocks_comparison_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_comparison_locales_parent_id_idx\` ON \`products_blocks_comparison_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_faq_items_order_idx\` ON \`products_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_faq_items_parent_id_idx\` ON \`products_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_faq_items_locales\` (
  	\`question\` text,
  	\`answer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_faq_items_locales_locale_parent_id_unique\` ON \`products_blocks_faq_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_faq_items_locales_parent_id_idx\` ON \`products_blocks_faq_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_faq_order_idx\` ON \`products_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_faq_parent_id_idx\` ON \`products_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_faq_path_idx\` ON \`products_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_faq_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_faq_locales_locale_parent_id_unique\` ON \`products_blocks_faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_faq_locales_parent_id_idx\` ON \`products_blocks_faq_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`button_href\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_blocks_cta_order_idx\` ON \`products_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_cta_parent_id_idx\` ON \`products_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_cta_path_idx\` ON \`products_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`products_blocks_cta_locales\` (
  	\`heading\` text,
  	\`text\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_blocks_cta_locales_locale_parent_id_unique\` ON \`products_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_blocks_cta_locales_parent_id_idx\` ON \`products_blocks_cta_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_seo_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`keyword\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_seo_keywords_order_idx\` ON \`products_seo_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`products_seo_keywords_parent_id_idx\` ON \`products_seo_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_seo_keywords_locale_idx\` ON \`products_seo_keywords\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`products\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`category_id\` integer,
  	\`hero_image_id\` integer,
  	\`price_from\` text,
  	\`currency\` text DEFAULT 'USD',
  	\`seo_canonical_url\` text,
  	\`seo_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`ai_prompt\` text,
  	\`ai_model\` text,
  	\`ai_generated_at\` text,
  	\`ai_source_candidate_id\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_slug_idx\` ON \`products\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`products_category_idx\` ON \`products\` (\`category_id\`);`)
  await db.run(sql`CREATE INDEX \`products_hero_image_idx\` ON \`products\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_seo_seo_image_idx\` ON \`products\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`products_updated_at_idx\` ON \`products\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`products_created_at_idx\` ON \`products\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`products__status_idx\` ON \`products\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`products_locales\` (
  	\`name\` text,
  	\`excerpt\` text,
  	\`lead_time\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`products_locales_locale_parent_id_unique\` ON \`products_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_locales_parent_id_idx\` ON \`products_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`products_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`products_rels_order_idx\` ON \`products_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_parent_idx\` ON \`products_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_path_idx\` ON \`products_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`products_rels_media_id_idx\` ON \`products_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_tags\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_tags_order_idx\` ON \`_products_v_version_tags\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_tags_parent_id_idx\` ON \`_products_v_version_tags\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_tags_locales\` (
  	\`tag\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_tags\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_version_tags_locales_locale_parent_id_unique\` ON \`_products_v_version_tags_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_tags_locales_parent_id_idx\` ON \`_products_v_version_tags_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_specs\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_specs_order_idx\` ON \`_products_v_version_specs\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_specs_parent_id_idx\` ON \`_products_v_version_specs\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_specs_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`note\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_specs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_version_specs_locales_locale_parent_id_unique\` ON \`_products_v_version_specs_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_specs_locales_parent_id_idx\` ON \`_products_v_version_specs_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_highlights\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_highlights_order_idx\` ON \`_products_v_version_highlights\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_highlights_parent_id_idx\` ON \`_products_v_version_highlights\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_highlights_locales\` (
  	\`title\` text,
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_highlights\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_version_highlights_locales_locale_parent_id_uniq\` ON \`_products_v_version_highlights_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_highlights_locales_parent_id_idx\` ON \`_products_v_version_highlights_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_variants_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_variants_options_order_idx\` ON \`_products_v_version_variants_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_variants_options_parent_id_idx\` ON \`_products_v_version_variants_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_variants_options_locales\` (
  	\`label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_variants_options\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_version_variants_options_locales_locale_parent_i\` ON \`_products_v_version_variants_options_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_variants_options_locales_parent_id_idx\` ON \`_products_v_version_variants_options_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_variants\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_variants_order_idx\` ON \`_products_v_version_variants\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_variants_parent_id_idx\` ON \`_products_v_version_variants\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_variants_locales\` (
  	\`name\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_version_variants\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_version_variants_locales_locale_parent_id_unique\` ON \`_products_v_version_variants_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_variants_locales_parent_id_idx\` ON \`_products_v_version_variants_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_rich_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_rich_text_order_idx\` ON \`_products_v_blocks_rich_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_rich_text_parent_id_idx\` ON \`_products_v_blocks_rich_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_rich_text_path_idx\` ON \`_products_v_blocks_rich_text\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_rich_text_locales\` (
  	\`content\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_rich_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_rich_text_locales_locale_parent_id_unique\` ON \`_products_v_blocks_rich_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_rich_text_locales_parent_id_idx\` ON \`_products_v_blocks_rich_text_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_image_text\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`image_position\` text DEFAULT 'left',
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_image_text_order_idx\` ON \`_products_v_blocks_image_text\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_image_text_parent_id_idx\` ON \`_products_v_blocks_image_text\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_image_text_path_idx\` ON \`_products_v_blocks_image_text\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_image_text_image_idx\` ON \`_products_v_blocks_image_text\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_image_text_locales\` (
  	\`heading\` text,
  	\`body\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_image_text\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_image_text_locales_locale_parent_id_uniqu\` ON \`_products_v_blocks_image_text_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_image_text_locales_parent_id_idx\` ON \`_products_v_blocks_image_text_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_spec_table_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_spec_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_spec_table_rows_order_idx\` ON \`_products_v_blocks_spec_table_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_spec_table_rows_parent_id_idx\` ON \`_products_v_blocks_spec_table_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_spec_table_rows_locales\` (
  	\`label\` text,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_spec_table_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_spec_table_rows_locales_locale_parent_id_\` ON \`_products_v_blocks_spec_table_rows_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_spec_table_rows_locales_parent_id_idx\` ON \`_products_v_blocks_spec_table_rows_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_spec_table\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_spec_table_order_idx\` ON \`_products_v_blocks_spec_table\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_spec_table_parent_id_idx\` ON \`_products_v_blocks_spec_table\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_spec_table_path_idx\` ON \`_products_v_blocks_spec_table\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_spec_table_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_spec_table\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_spec_table_locales_locale_parent_id_uniqu\` ON \`_products_v_blocks_spec_table_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_spec_table_locales_parent_id_idx\` ON \`_products_v_blocks_spec_table_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_size_guide\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_size_guide_order_idx\` ON \`_products_v_blocks_size_guide\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_size_guide_parent_id_idx\` ON \`_products_v_blocks_size_guide\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_size_guide_path_idx\` ON \`_products_v_blocks_size_guide\` (\`_path\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_size_guide_image_idx\` ON \`_products_v_blocks_size_guide\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_size_guide_locales\` (
  	\`title\` text,
  	\`notes\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_size_guide\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_size_guide_locales_locale_parent_id_uniqu\` ON \`_products_v_blocks_size_guide_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_size_guide_locales_parent_id_idx\` ON \`_products_v_blocks_size_guide_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_comparison_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_comparison\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_comparison_items_order_idx\` ON \`_products_v_blocks_comparison_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_comparison_items_parent_id_idx\` ON \`_products_v_blocks_comparison_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_comparison_items_locales\` (
  	\`title\` text,
  	\`text\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_comparison_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_comparison_items_locales_locale_parent_id\` ON \`_products_v_blocks_comparison_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_comparison_items_locales_parent_id_idx\` ON \`_products_v_blocks_comparison_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_comparison\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_comparison_order_idx\` ON \`_products_v_blocks_comparison\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_comparison_parent_id_idx\` ON \`_products_v_blocks_comparison\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_comparison_path_idx\` ON \`_products_v_blocks_comparison\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_comparison_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_comparison\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_comparison_locales_locale_parent_id_uniqu\` ON \`_products_v_blocks_comparison_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_comparison_locales_parent_id_idx\` ON \`_products_v_blocks_comparison_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_faq_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_faq_items_order_idx\` ON \`_products_v_blocks_faq_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_faq_items_parent_id_idx\` ON \`_products_v_blocks_faq_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_faq_items_locales\` (
  	\`question\` text,
  	\`answer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_faq_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_faq_items_locales_locale_parent_id_unique\` ON \`_products_v_blocks_faq_items_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_faq_items_locales_parent_id_idx\` ON \`_products_v_blocks_faq_items_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_faq_order_idx\` ON \`_products_v_blocks_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_faq_parent_id_idx\` ON \`_products_v_blocks_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_faq_path_idx\` ON \`_products_v_blocks_faq\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_faq_locales\` (
  	\`title\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_faq_locales_locale_parent_id_unique\` ON \`_products_v_blocks_faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_faq_locales_parent_id_idx\` ON \`_products_v_blocks_faq_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_cta\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_path\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`button_href\` text,
  	\`_uuid\` text,
  	\`block_name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_cta_order_idx\` ON \`_products_v_blocks_cta\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_cta_parent_id_idx\` ON \`_products_v_blocks_cta\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_cta_path_idx\` ON \`_products_v_blocks_cta\` (\`_path\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_blocks_cta_locales\` (
  	\`heading\` text,
  	\`text\` text,
  	\`button_label\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v_blocks_cta\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_blocks_cta_locales_locale_parent_id_unique\` ON \`_products_v_blocks_cta_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_blocks_cta_locales_parent_id_idx\` ON \`_products_v_blocks_cta_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_version_seo_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`keyword\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_version_seo_keywords_order_idx\` ON \`_products_v_version_seo_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_seo_keywords_parent_id_idx\` ON \`_products_v_version_seo_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_seo_keywords_locale_idx\` ON \`_products_v_version_seo_keywords\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_products_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_category_id\` integer,
  	\`version_hero_image_id\` integer,
  	\`version_price_from\` text,
  	\`version_currency\` text DEFAULT 'USD',
  	\`version_seo_canonical_url\` text,
  	\`version_seo_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version_ai_prompt\` text,
  	\`version_ai_model\` text,
  	\`version_ai_generated_at\` text,
  	\`version_ai_source_candidate_id\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_category_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_parent_idx\` ON \`_products_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_slug_idx\` ON \`_products_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_category_idx\` ON \`_products_v\` (\`version_category_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_hero_image_idx\` ON \`_products_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_seo_version_seo_image_idx\` ON \`_products_v\` (\`version_seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_updated_at_idx\` ON \`_products_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version_created_at_idx\` ON \`_products_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_version_version__status_idx\` ON \`_products_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_created_at_idx\` ON \`_products_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_updated_at_idx\` ON \`_products_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_snapshot_idx\` ON \`_products_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_published_locale_idx\` ON \`_products_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_latest_idx\` ON \`_products_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_locales\` (
  	\`version_name\` text,
  	\`version_excerpt\` text,
  	\`version_lead_time\` text,
  	\`version_seo_title\` text,
  	\`version_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_products_v_locales_locale_parent_id_unique\` ON \`_products_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_locales_parent_id_idx\` ON \`_products_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_products_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_products_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_products_v_rels_order_idx\` ON \`_products_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_parent_idx\` ON \`_products_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_path_idx\` ON \`_products_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_products_v_rels_media_id_idx\` ON \`_products_v_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_faq_order_idx\` ON \`pages_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_faq_parent_id_idx\` ON \`pages_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_faq_locales\` (
  	\`question\` text,
  	\`answer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_faq_locales_locale_parent_id_unique\` ON \`pages_faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_faq_locales_parent_id_idx\` ON \`pages_faq_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_seo_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`keyword\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_seo_keywords_order_idx\` ON \`pages_seo_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_keywords_parent_id_idx\` ON \`pages_seo_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_keywords_locale_idx\` ON \`pages_seo_keywords\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text,
  	\`path\` text,
  	\`page_type\` text DEFAULT 'guide',
  	\`hero_image_id\` integer,
  	\`seo_canonical_url\` text,
  	\`seo_image_id\` integer,
  	\`seo_noindex\` integer DEFAULT false,
  	\`ai_prompt\` text,
  	\`ai_model\` text,
  	\`ai_generated_at\` text,
  	\`ai_source_candidate_id\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_slug_idx\` ON \`pages\` (\`slug\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_path_idx\` ON \`pages\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_hero_image_idx\` ON \`pages\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_seo_seo_image_idx\` ON \`pages\` (\`seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`pages__status_idx\` ON \`pages\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`pages_locales\` (
  	\`title\` text,
  	\`excerpt\` text,
  	\`body\` text,
  	\`seo_title\` text,
  	\`seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`pages_locales_locale_parent_id_unique\` ON \`pages_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_locales_parent_id_idx\` ON \`pages_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pages_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_rels_order_idx\` ON \`pages_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_parent_idx\` ON \`pages_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_path_idx\` ON \`pages_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_products_id_idx\` ON \`pages_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_rels_pages_id_idx\` ON \`pages_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_version_faq\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_version_faq_order_idx\` ON \`_pages_v_version_faq\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_faq_parent_id_idx\` ON \`_pages_v_version_faq\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_version_faq_locales\` (
  	\`question\` text,
  	\`answer\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v_version_faq\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_version_faq_locales_locale_parent_id_unique\` ON \`_pages_v_version_faq_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_faq_locales_parent_id_idx\` ON \`_pages_v_version_faq_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_version_seo_keywords\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`keyword\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_version_seo_keywords_order_idx\` ON \`_pages_v_version_seo_keywords\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_seo_keywords_parent_id_idx\` ON \`_pages_v_version_seo_keywords\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_seo_keywords_locale_idx\` ON \`_pages_v_version_seo_keywords\` (\`_locale\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_slug\` text,
  	\`version_path\` text,
  	\`version_page_type\` text DEFAULT 'guide',
  	\`version_hero_image_id\` integer,
  	\`version_seo_canonical_url\` text,
  	\`version_seo_image_id\` integer,
  	\`version_seo_noindex\` integer DEFAULT false,
  	\`version_ai_prompt\` text,
  	\`version_ai_model\` text,
  	\`version_ai_generated_at\` text,
  	\`version_ai_source_candidate_id\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`snapshot\` integer,
  	\`published_locale\` text,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_seo_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_parent_idx\` ON \`_pages_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_slug_idx\` ON \`_pages_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_path_idx\` ON \`_pages_v\` (\`version_path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_hero_image_idx\` ON \`_pages_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_seo_version_seo_image_idx\` ON \`_pages_v\` (\`version_seo_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_updated_at_idx\` ON \`_pages_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version_created_at_idx\` ON \`_pages_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_version_version__status_idx\` ON \`_pages_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_created_at_idx\` ON \`_pages_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_updated_at_idx\` ON \`_pages_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_snapshot_idx\` ON \`_pages_v\` (\`snapshot\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_published_locale_idx\` ON \`_pages_v\` (\`published_locale\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_latest_idx\` ON \`_pages_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_locales\` (
  	\`version_title\` text,
  	\`version_excerpt\` text,
  	\`version_body\` text,
  	\`version_seo_title\` text,
  	\`version_seo_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`_pages_v_locales_locale_parent_id_unique\` ON \`_pages_v_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_locales_parent_id_idx\` ON \`_pages_v_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pages_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_pages_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_order_idx\` ON \`_pages_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_parent_idx\` ON \`_pages_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_path_idx\` ON \`_pages_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_products_id_idx\` ON \`_pages_v_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`_pages_v_rels_pages_id_idx\` ON \`_pages_v_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`categories_id\` integer,
  	\`products_id\` integer,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`categories_id\`) REFERENCES \`categories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_categories_id_idx\` ON \`payload_locked_documents_rels\` (\`categories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_products_id_idx\` ON \`payload_locked_documents_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_nav\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`href\` text NOT NULL,
  	\`external\` integer DEFAULT false,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_nav_order_idx\` ON \`site_settings_nav\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_parent_id_idx\` ON \`site_settings_nav\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_nav_locales\` (
  	\`label\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings_nav\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_nav_locales_locale_parent_id_unique\` ON \`site_settings_nav_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_nav_locales_parent_id_idx\` ON \`site_settings_nav_locales\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`brand_name\` text NOT NULL,
  	\`logo_id\` integer,
  	\`contact_email\` text,
  	\`theme_primary_color\` text DEFAULT '#1f5c4a',
  	\`theme_accent_color\` text DEFAULT '#c98a3c',
  	\`theme_surface_color\` text DEFAULT '#ffffff',
  	\`theme_page_color\` text DEFAULT '#f6f4ef',
  	\`theme_text_color\` text DEFAULT '#1c1b19',
  	\`seo_defaults_default_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seo_defaults_default_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_logo_idx\` ON \`site_settings\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_seo_defaults_seo_defaults_default_image_idx\` ON \`site_settings\` (\`seo_defaults_default_image_id\`);`)
  await db.run(sql`CREATE TABLE \`site_settings_locales\` (
  	\`tagline\` text,
  	\`footer_text\` text,
  	\`seo_defaults_title_suffix\` text,
  	\`seo_defaults_default_description\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`site_settings\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`site_settings_locales_locale_parent_id_unique\` ON \`site_settings_locales\` (\`_locale\`,\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`site_settings_locales_parent_id_idx\` ON \`site_settings_locales\` (\`_parent_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`media_locales\`;`)
  await db.run(sql`DROP TABLE \`categories_seo_keywords\`;`)
  await db.run(sql`DROP TABLE \`categories\`;`)
  await db.run(sql`DROP TABLE \`categories_locales\`;`)
  await db.run(sql`DROP TABLE \`products_tags\`;`)
  await db.run(sql`DROP TABLE \`products_tags_locales\`;`)
  await db.run(sql`DROP TABLE \`products_specs\`;`)
  await db.run(sql`DROP TABLE \`products_specs_locales\`;`)
  await db.run(sql`DROP TABLE \`products_highlights\`;`)
  await db.run(sql`DROP TABLE \`products_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`products_variants_options\`;`)
  await db.run(sql`DROP TABLE \`products_variants_options_locales\`;`)
  await db.run(sql`DROP TABLE \`products_variants\`;`)
  await db.run(sql`DROP TABLE \`products_variants_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_rich_text_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_image_text_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_spec_table_rows\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_spec_table_rows_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_spec_table\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_spec_table_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_size_guide\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_size_guide_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_comparison_items\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_comparison_items_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_comparison\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_comparison_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_faq_locales\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`products_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`products_seo_keywords\`;`)
  await db.run(sql`DROP TABLE \`products\`;`)
  await db.run(sql`DROP TABLE \`products_locales\`;`)
  await db.run(sql`DROP TABLE \`products_rels\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_tags\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_tags_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_specs\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_specs_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_highlights\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_highlights_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_variants_options\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_variants_options_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_variants\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_variants_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_rich_text\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_rich_text_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_image_text\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_image_text_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_spec_table_rows\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_spec_table_rows_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_spec_table\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_spec_table_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_size_guide\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_size_guide_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_comparison_items\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_comparison_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_comparison\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_comparison_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_faq_items\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_faq_items_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_faq\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_faq_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_cta\`;`)
  await db.run(sql`DROP TABLE \`_products_v_blocks_cta_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_version_seo_keywords\`;`)
  await db.run(sql`DROP TABLE \`_products_v\`;`)
  await db.run(sql`DROP TABLE \`_products_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_products_v_rels\`;`)
  await db.run(sql`DROP TABLE \`pages_faq\`;`)
  await db.run(sql`DROP TABLE \`pages_faq_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_seo_keywords\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`pages_locales\`;`)
  await db.run(sql`DROP TABLE \`pages_rels\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_faq\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_faq_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_version_seo_keywords\`;`)
  await db.run(sql`DROP TABLE \`_pages_v\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_locales\`;`)
  await db.run(sql`DROP TABLE \`_pages_v_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav\`;`)
  await db.run(sql`DROP TABLE \`site_settings_nav_locales\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`site_settings_locales\`;`)
}
