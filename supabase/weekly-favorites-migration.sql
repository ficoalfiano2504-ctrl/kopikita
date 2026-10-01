create or replace function public.get_weekly_menu_sales()
returns table(menu_id bigint, quantity bigint)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with current_week as (
    select date_trunc(
      'week',
      (now() at time zone 'Asia/Jakarta') + interval '1 day'
    ) - interval '1 day' as start_local
  ),
  previous_week as (
    select
      (start_local - interval '1 week') at time zone 'Asia/Jakarta' as starts_at,
      start_local at time zone 'Asia/Jakarta' as ends_at
    from current_week
  ),
  weekly_sales as (
    select
      (item.value ->> 'id')::bigint as menu_id,
      sum((item.value ->> 'qty')::bigint)::bigint as quantity
    from public.orders as order_record
    cross join lateral jsonb_array_elements(order_record.items) as item(value)
    cross join previous_week
    where order_record.created_at >= previous_week.starts_at
      and order_record.created_at < previous_week.ends_at
    group by (item.value ->> 'id')::bigint
  )
  select weekly_sales.menu_id, weekly_sales.quantity
  from weekly_sales
  join public.menu_items on menu_items.id = weekly_sales.menu_id
  order by weekly_sales.quantity desc, weekly_sales.menu_id
  limit 4;
$$;

revoke all on function public.get_weekly_menu_sales() from public;
grant execute on function public.get_weekly_menu_sales() to anon, authenticated;
notify pgrst, 'reload schema';