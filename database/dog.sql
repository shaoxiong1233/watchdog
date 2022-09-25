DROP TABLE  IF EXISTS dog;
CREATE TABLE dog
(
    coin            char(64)     NOT NULL,
    tag_name        char(64)     NOT NULL,
    html_url        char(255)     NOT NULL,
    github_created  timestamp    NOT NULL,
    github_published  timestamp    NOT NULL,
    created_at      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP on update CURRENT_TIMESTAMP,
    PRIMARY KEY (coin),
    INDEX (updated_at)
);
