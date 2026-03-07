-- Reset user account: olamidotunloto@gmail.com
-- This migration:
-- 1. Deletes answers from the user
-- 2. Unclaims their node
-- 3. Deletes their profile
-- 4. Deletes their auth user
-- After running, the user can re-register with the same email

DO $$
DECLARE
  target_email TEXT := 'olamidotunloto@gmail.com';
  user_id UUID;
  node_id UUID;
BEGIN
  -- Get the user ID from auth
  SELECT id INTO user_id FROM auth.users WHERE email = target_email;

  IF user_id IS NULL THEN
    RAISE NOTICE 'User with email % not found. Nothing to reset.', target_email;
    RETURN;
  END IF;

  -- Get the node they claimed
  SELECT tree_node_id INTO node_id FROM profiles WHERE id = user_id;

  -- Step 1: Delete any answers from this user
  DELETE FROM answers WHERE respondent_id = user_id;
  RAISE NOTICE 'Deleted answers for user %', user_id;

  -- Step 2: Unclaim the node (set is_claimed = false, claimed_by = null)
  IF node_id IS NOT NULL THEN
    UPDATE family_tree_nodes
    SET is_claimed = false, claimed_by = null
    WHERE id = node_id;
    RAISE NOTICE 'Unclaimed node %', node_id;
  END IF;

  -- Step 3: Delete the profile (must happen before deleting auth user due to FK)
  DELETE FROM profiles WHERE id = user_id;
  RAISE NOTICE 'Deleted profile for user %', user_id;

  -- Step 4: Delete the auth user
  DELETE FROM auth.users WHERE id = user_id;
  RAISE NOTICE 'Deleted auth user %', user_id;

  RAISE NOTICE 'SUCCESS: User % has been reset. They can now re-register.', target_email;
END $$;
