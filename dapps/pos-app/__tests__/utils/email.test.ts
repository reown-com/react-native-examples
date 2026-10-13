import { isValidEmail } from "@/utils/email";

describe("isValidEmail", () => {
  it.each(["lea@gmail.com", "first.last+pos@shop.co.uk", "  lea@gmail.com  "])(
    "accepts %p",
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each(["", "   ", "lea", "lea@gmail", "@gmail.com", "lea @gmail.com"])(
    "rejects %p",
    (email) => {
      expect(isValidEmail(email)).toBe(false);
    },
  );
});
