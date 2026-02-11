package io.demo;

import org.apache.hadoop.hive.ql.exec.UDF;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.Temporal;

/**
 * 自定义日期函数，用于解决doris原本的 date_add 与presto参数不一致问题
 */
public class DateAdd extends UDF {

    /**
     * 实现 Presto 的 date_add 功能
     *
     * @param unit   时间单位 ("day", "month", "year")
     * @param amount 要添加的数量
     * @param date   输入的日期字符串 (格式: yyyy-MM-dd)
     * @return 添加后的新日期字符串 (格式: yyyy-mm-dd)
     */
    public <T extends Temporal> LocalDate evaluate(String unit, int amount, LocalDate date) {
        return dateAdd(unit, amount, date);
    }

    /**
     * 实现 Presto 的 date_add 功能
     *
     * @param unit   时间单位 ("day", "month", "year")
     * @param amount 要添加的数量
     * @param date   输入的日期字符串 (格式: yyyy-MM-dd HH:mm:ss)
     * @return 添加后的新日期字符串 (格式: yyyy-MM-dd HH:mm:ss)
     */
    public <T extends Temporal> LocalDateTime evaluate(String unit, int amount, LocalDateTime date) {
        return dateAdd(unit, amount, date);
    }

    /**
     * 实现 Presto 的 date_add 功能
     *
     * @param unit   时间单位 ("day", "month", "year")
     * @param amount 要添加的数量
     * @param date   输入的日期对象 (LocalDate 或 LocalDateTime)
     * @return 添加后的新日期对象 (与输入类型一致)
     */
    public <T extends Temporal> T dateAdd(String unit, int amount, T date) {

        if (date == null) {
            throw new IllegalArgumentException("Date cannot be null");
        }
        LocalDateTime dateTime;
        // 判断输入类型并转换为 LocalDateTime
        if (date instanceof LocalDate) {
            dateTime = ((LocalDate) date).atStartOfDay();
        } else if (date instanceof LocalDateTime) {
            dateTime = (LocalDateTime) date;
        } else {
            throw new IllegalArgumentException("Unsupported Temporal type: " + date.getClass().getSimpleName());
        }

        // 根据时间单位进行日期计算
        switch (unit.toLowerCase()) {
            case "second":
                dateTime = dateTime.plusSeconds(amount);
                break;
            case "minute":
                dateTime = dateTime.plusMinutes(amount);
                break;
            case "hour":
                dateTime = dateTime.plusHours(amount);
                break;
            case "day":
                dateTime = dateTime.plusDays(amount);
                break;
            case "week":
                dateTime = dateTime.plusWeeks(amount);
                break;
            case "month":
                dateTime = dateTime.plusMonths(amount);
                break;
            case "quarter":
                dateTime = dateTime.plusMonths(amount * 3L);
                break;
            case "year":
                dateTime = dateTime.plusYears(amount);
                break;
            default:
                throw new IllegalArgumentException("Unsupported time unit: " + unit);
        }
        // 根据原始输入类型返回对应类型的对象
        if (date instanceof LocalDate) {
            return (T) dateTime.toLocalDate();
        } else {
            return (T) dateTime;
        }
    }

}

