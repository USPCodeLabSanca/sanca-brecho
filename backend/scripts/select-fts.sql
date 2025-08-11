-- -- gerando tsvector sob demanda (custob de performance alto)
-- select title, keywords, 
--         ts_rank(to_tsvector(title) || ' ' ||  to_tsvector(keywords), websearch_to_tsquery('celular')) as rank
-- from listings
-- where to_tsvector(title) || ' ' ||  to_tsvector(keywords) 
--         @@ websearch_to_tsquery('celular')
-- order by rank desc; 

-- gerando tsvector como generated colums (tipo views mas para colunas)
alter table listings
add title_search tsvector
generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') || ' ' ||
    setweight(to_tsvector('simple', coalesce(keywords, '')), 'B') :: tsvector
) stored;

-- nova query
select title, keywords, ts_rank(title_search, websearch_to_tsquery('celular')) as rank
from listings
where title_search @@ websearch_to_tsquery('celular')

-- indexando para ficar mai rapido
create index idx_search on listings using GIN(title_search);
