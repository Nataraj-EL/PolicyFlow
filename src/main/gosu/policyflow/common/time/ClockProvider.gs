package policyflow.common.time

uses java.time.Clock
uses java.time.Instant
uses java.time.LocalDate
uses java.time.LocalDateTime
uses java.time.ZoneId

/**
 * Global provider for virtualizing standard time/date operations.
 * Allows detaching tests from System.currentTimeMillis() for deterministic behavior.
 */
public class ClockProvider {
  private static var _clock : Clock = Clock.systemDefaultZone()

  /**
   * Retrieves the current LocalDate resolved by the configured clock.
   * 
   * @return The current LocalDate.
   */
  public static function nowLocalDate() : LocalDate {
    return LocalDate.now(_clock)
  }

  /**
   * Retrieves the current LocalDateTime resolved by the configured clock.
   * 
   * @return The current LocalDateTime.
   */
  public static function nowLocalDateTime() : LocalDateTime {
    return LocalDateTime.now(_clock)
  }

  /**
   * Overrides the current clock with a mock fixed clock at the specified date (at start of day).
   * 
   * @param date The mock local date.
   */
  public static function setMockClock(date : LocalDate) {
    if (date != null) {
      var instant = date.atStartOfDay(ZoneId.systemDefault()).toInstant()
      _clock = Clock.fixed(instant, ZoneId.systemDefault())
    }
  }

  /**
   * Overrides the current clock with a mock fixed clock at the specified dateTime.
   * 
   * @param dateTime The mock local date time.
   */
  public static function setMockClock(dateTime : LocalDateTime) {
    if (dateTime != null) {
      var instant = dateTime.atZone(ZoneId.systemDefault()).toInstant()
      _clock = Clock.fixed(instant, ZoneId.systemDefault())
    }
  }

  /**
   * Resets the provider to use the standard default system clock.
   */
  public static function resetToSystemClock() {
    _clock = Clock.systemDefaultZone()
  }
}
