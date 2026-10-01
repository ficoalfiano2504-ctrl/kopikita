-- Permanently deletes every order and menu item. Review before running.
begin;

truncate table public.orders, public.menu_items restart identity;

commit;

notify pgrst, 'reload schema';