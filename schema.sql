DROP TABLE IF EXISTS cityexplorer;

CREATE TABLE cityexplorer (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude numeric(10, 7),
    longitude numeric(10, 7)
);
