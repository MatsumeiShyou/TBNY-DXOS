-- AMP 012: staffsテーブルにauth_uidカラム追加 + デモアカウント投入
-- 目的: Supabase Auth と staffs テーブルの紐づけ（物理層の欠損を解消）

-- 1. auth_uid カラムの追加（Authユーザーとの紐づけ用）
ALTER TABLE staffs ADD COLUMN IF NOT EXISTS auth_uid uuid UNIQUE;

-- 2. staffs に対する RLS ポリシー追加（認証済みユーザーが自身のレコードを読める）
CREATE POLICY "staffs_select_own" ON staffs FOR SELECT
  USING (auth.uid() = auth_uid);

-- 3. デモアカウントの投入（admin@tbny.co.jp = auth.users の 34f6c0d4-34c0-48df-a52a-5bdb8901e43b）
INSERT INTO staffs (name, role, auth_uid, allowed_apps)
VALUES (
  'デモ管理者',
  'admin',
  '34f6c0d4-34c0-48df-a52a-5bdb8901e43b',
  '["repaper-route-admin", "repaper-route-driver", "master-data", "weighing-self-driver", "weighing-admin"]'::jsonb
);
