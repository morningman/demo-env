-- 1. First, upload the compiled JAR package (target/doris-java-udf-demo.jar) to a path accessible by Doris BE nodes,
--    or upload it to HDFS / HTTP server.
--    For example: 
--    file:///home/doris/udf/doris-java-udf-demo.jar
--    hdfs://namenode:port/user/doris/udf/doris-java-udf-demo.jar
--    http://your-server/doris-java-udf-demo.jar

-- 2. Create a function for DATE type
CREATE FUNCTION date_add_presto(STRING, INT, DATE) 
RETURNS DATE 
PROPERTIES (
    "file"="file:///path/to/doris-java-udf-demo.jar", 
    "symbol"="io.demo.DateAdd", 
    "type"="JAVA_UDF"
);

-- 3. Create a function for DATETIME type (Doris supports function overloading with the same name)
CREATE FUNCTION date_add_presto(STRING, INT, DATETIME) 
RETURNS DATETIME 
PROPERTIES (
    "file"="file:///path/to/doris-java-udf-demo.jar", 
    "symbol"="io.demo.DateAdd", 
    "type"="JAVA_UDF"
);

-- 4. Usage examples
-- SELECT date_add_presto('day', 1, to_date('2023-01-01'));
-- SELECT date_add_presto('month', -1, to_date('2023-01-01'));
