# Doris Java UDF Demo

This is an Apache Doris Java UDF demo project that implements a Presto-compatible `date_add` function to solve the parameter inconsistency between Doris's native `date_add` and Presto's `date_add`.

## Features

This project implements a flexible date addition UDF that supports time unit operations (addition/subtraction) on DATE and DATETIME types.

### Supported Time Units

- `second` - second
- `minute` - minute
- `hour` - hour
- `day` - day
- `week` - week
- `month` - month
- `quarter` - quarter
- `year` - year

## Prerequisites

- Java 8+
- Maven 3.6+
- Apache Doris environment

## Quick Start

### 1. Build the Project

Run the build script:

```bash
./build.sh
```

Or use Maven directly:

```bash
mvn clean package
```

After successful compilation, the JAR file will be generated at `target/doris-java-udf-demo.jar`

### 2. Deploy the JAR File

Upload the generated JAR file to a location accessible by Doris BE nodes. The following path formats are supported:

- Local filesystem: `file:///path/to/doris-java-udf-demo.jar`
- HDFS: `hdfs://namenode:port/user/doris/udf/doris-java-udf-demo.jar`
- HTTP server: `http://your-server/doris-java-udf-demo.jar`

### 3. Register the UDF in Doris

Connect to Doris and execute the SQL statements from `register_udf.sql` to register the functions:

```sql
CREATE FUNCTION date_add_presto(STRING, INT, DATE)
RETURNS DATE
PROPERTIES (
    "file"="file:///path/to/doris-java-udf-demo.jar",
    "symbol"="io.demo.DateAdd",
    "type"="JAVA_UDF"
);

CREATE FUNCTION date_add_presto(STRING, INT, DATETIME)
RETURNS DATETIME
PROPERTIES (
    "file"="file:///path/to/doris-java-udf-demo.jar",
    "symbol"="io.demo.DateAdd",
    "type"="JAVA_UDF"
);
```

## Usage Examples

### Operating on DATE Type

```sql
-- Add 1 day
SELECT date_add_presto('day', 1, to_date('2023-01-01'));
-- Result: 2023-01-02

-- Subtract 1 month
SELECT date_add_presto('month', -1, to_date('2023-01-01'));
-- Result: 2022-12-01

-- Add 2 years
SELECT date_add_presto('year', 2, to_date('2023-01-01'));
-- Result: 2025-01-01
```

### Operating on DATETIME Type

```sql
-- Add 5 hours
SELECT date_add_presto('hour', 5, '2023-01-01 10:00:00');
-- Result: 2023-01-01 15:00:00

-- Add 30 minutes
SELECT date_add_presto('minute', 30, '2023-01-01 10:00:00');
-- Result: 2023-01-01 10:30:00
```

## UDF Parameters

### DateAdd UDF

**Method Signature:**

```java
public <T extends Temporal> T dateAdd(String unit, int amount, T date)
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| unit | STRING | Time unit, supported values: second, minute, hour, day, week, month, quarter, year |
| amount | INT | Amount to add, can be negative (for subtraction) |
| date | DATE/DATETIME | Input date or datetime |

**Return Value:**

- If input is DATE, returns DATE type
- If input is DATETIME, returns DATETIME type

## Project Structure

```
.
├── build.sh                                          # Build script
├── pom.xml                                           # Maven configuration file
├── register_udf.sql                                  # UDF registration SQL script
├── README.md                                         # Project documentation
└── src/main/java/io/demo/
    └── DateAdd.java                                  # DateAdd UDF implementation
```

## Important Notes

1. **JAR File Path**: When executing the CREATE FUNCTION statement, ensure the JAR file path is accessible to all Doris BE nodes.

2. **Date Format**: Ensure the input date string format complies with Doris requirements:
   - DATE type: `yyyy-MM-dd`
   - DATETIME type: `yyyy-MM-dd HH:mm:ss`

3. **Null Handling**: The function does not accept null date values and will throw an `IllegalArgumentException`.

4. **Time Unit Case Sensitivity**: Time unit parameters are case-insensitive (internally processed with toLowerCase()).

## Troubleshooting

### Common Issues

1. **"Build failed"**: Ensure Maven is installed and Java version is 8 or higher.

2. **"Cannot find function"**: Check that the JAR file path is correct and accessible from all BE nodes.

3. **"Unsupported time unit"**: Check that the time unit parameter is in the supported list.

## License

MIT

## Project Information

- **Project Name**: doris-java-udf-demo
- **Version**: 1.0-SNAPSHOT
- **Java Version**: 8
- **Hive Version**: 2.3.9
