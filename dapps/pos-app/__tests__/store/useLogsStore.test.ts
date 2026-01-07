import { useLogsStore } from "@/store/useLogsStore";
import { resetLogsStore } from "../utils/store-helpers";

describe("useLogsStore", () => {
  beforeEach(() => {
    resetLogsStore();
  });

  describe("initial state", () => {
    it("should have empty logs array initially", () => {
      const { logs } = useLogsStore.getState();
      expect(logs).toEqual([]);
    });

    it("should have _hasHydrated set to false initially", () => {
      const { _hasHydrated } = useLogsStore.getState();
      expect(_hasHydrated).toBe(false);
    });
  });

  describe("addLog", () => {
    it("should add a log entry with all required fields", () => {
      const { addLog } = useLogsStore.getState();

      addLog("info", "Test message");

      const { logs } = useLogsStore.getState();
      expect(logs).toHaveLength(1);
      expect(logs[0]).toMatchObject({
        level: "info",
        message: "Test message",
      });
      expect(logs[0].id).toBeDefined();
      expect(logs[0].timestamp).toBeDefined();
      expect(typeof logs[0].timestamp).toBe("number");
    });

    it("should add log with view parameter", () => {
      const { addLog } = useLogsStore.getState();

      addLog("info", "Test message", "settings");

      const { logs } = useLogsStore.getState();
      expect(logs[0].view).toBe("settings");
    });

    it("should add log with functionName parameter", () => {
      const { addLog } = useLogsStore.getState();

      addLog("info", "Test message", "settings", "handleSubmit");

      const { logs } = useLogsStore.getState();
      expect(logs[0].functionName).toBe("handleSubmit");
    });

    it("should add log with data parameter", () => {
      const { addLog } = useLogsStore.getState();
      const testData = { userId: 123, action: "login" };

      addLog("info", "Test message", "auth", "login", testData);

      const { logs } = useLogsStore.getState();
      expect(logs[0].data).toEqual(testData);
    });

    it("should support all log levels", () => {
      const { addLog } = useLogsStore.getState();

      addLog("log", "Log message");
      addLog("info", "Info message");
      addLog("error", "Error message");

      const { logs } = useLogsStore.getState();
      expect(logs).toHaveLength(3);
      expect(logs[0].level).toBe("log");
      expect(logs[1].level).toBe("info");
      expect(logs[2].level).toBe("error");
    });

    it("should add logs in chronological order (newest at end)", () => {
      const { addLog } = useLogsStore.getState();

      addLog("info", "First message");
      addLog("info", "Second message");
      addLog("info", "Third message");

      const { logs } = useLogsStore.getState();
      expect(logs[0].message).toBe("First message");
      expect(logs[1].message).toBe("Second message");
      expect(logs[2].message).toBe("Third message");
    });

    it("should generate unique IDs for each log entry", () => {
      const { addLog } = useLogsStore.getState();

      addLog("info", "Message 1");
      addLog("info", "Message 2");
      addLog("info", "Message 3");

      const { logs } = useLogsStore.getState();
      const ids = logs.map((log) => log.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe("MAX_LOGS_COUNT limit", () => {
    it("should keep only the last 100 logs when limit is exceeded", () => {
      const { addLog } = useLogsStore.getState();
      const MAX_LOGS_COUNT = 100;

      // Add more than MAX_LOGS_COUNT logs
      for (let i = 1; i <= MAX_LOGS_COUNT + 10; i++) {
        addLog("info", `Message ${i}`);
      }

      const { logs } = useLogsStore.getState();
      expect(logs).toHaveLength(MAX_LOGS_COUNT);

      // Should have kept the newest logs (last 100)
      expect(logs[0].message).toBe("Message 11");
      expect(logs[MAX_LOGS_COUNT - 1].message).toBe(
        `Message ${MAX_LOGS_COUNT + 10}`,
      );
    });

    it("should not truncate logs when under the limit", () => {
      const { addLog } = useLogsStore.getState();

      for (let i = 1; i <= 50; i++) {
        addLog("info", `Message ${i}`);
      }

      const { logs } = useLogsStore.getState();
      expect(logs).toHaveLength(50);
      expect(logs[0].message).toBe("Message 1");
    });
  });

  describe("clearLogs", () => {
    it("should remove all logs", () => {
      const { addLog, clearLogs } = useLogsStore.getState();

      addLog("info", "Message 1");
      addLog("error", "Message 2");
      addLog("log", "Message 3");

      // Verify logs exist
      expect(useLogsStore.getState().logs).toHaveLength(3);

      clearLogs();

      expect(useLogsStore.getState().logs).toEqual([]);
    });

    it("should work when logs are already empty", () => {
      const { clearLogs } = useLogsStore.getState();

      // Should not throw
      expect(() => clearLogs()).not.toThrow();
      expect(useLogsStore.getState().logs).toEqual([]);
    });
  });

  describe("setHasHydrated", () => {
    it("should set _hasHydrated to true", () => {
      const { setHasHydrated } = useLogsStore.getState();

      setHasHydrated(true);

      expect(useLogsStore.getState()._hasHydrated).toBe(true);
    });

    it("should set _hasHydrated to false", () => {
      // First set to true
      useLogsStore.getState().setHasHydrated(true);
      expect(useLogsStore.getState()._hasHydrated).toBe(true);

      // Then set to false
      useLogsStore.getState().setHasHydrated(false);
      expect(useLogsStore.getState()._hasHydrated).toBe(false);
    });
  });

  describe("persistence and hydration", () => {
    it("should track hydration state correctly", () => {
      // Initial state should not be hydrated (reset in beforeEach)
      expect(useLogsStore.getState()._hasHydrated).toBe(false);

      // Simulate hydration completion
      useLogsStore.getState().setHasHydrated(true);
      expect(useLogsStore.getState()._hasHydrated).toBe(true);
    });

    it("should preserve logs through hydration state changes", () => {
      const { addLog } = useLogsStore.getState();

      // Add logs before hydration
      addLog("info", "Pre-hydration log");

      // Simulate hydration
      useLogsStore.getState().setHasHydrated(true);

      // Add logs after hydration
      addLog("info", "Post-hydration log");

      // Both logs should exist
      const logs = useLogsStore.getState().logs;
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe("Pre-hydration log");
      expect(logs[1].message).toBe("Post-hydration log");
    });

    it("should allow clearing logs regardless of hydration state", () => {
      const { addLog, clearLogs, setHasHydrated } = useLogsStore.getState();

      // Add logs
      addLog("info", "Test log 1");
      addLog("info", "Test log 2");

      // Hydrate
      setHasHydrated(true);

      // Clear should work
      clearLogs();
      expect(useLogsStore.getState().logs).toEqual([]);

      // Hydration state should be preserved
      expect(useLogsStore.getState()._hasHydrated).toBe(true);
    });
  });
});
