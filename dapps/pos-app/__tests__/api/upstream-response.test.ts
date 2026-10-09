import { readUpstreamResponse } from "../../api/_utils";

function upstream(status: number, body: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

describe("readUpstreamResponse", () => {
  it("passes through a JSON body with its status", async () => {
    await expect(
      readUpstreamResponse(upstream(201, '{"paymentId":"pay_1"}')),
    ).resolves.toEqual({ ok: true, status: 201, data: { paymentId: "pay_1" } });
  });

  it("treats an empty body as an empty object", async () => {
    await expect(readUpstreamResponse(upstream(204, ""))).resolves.toEqual({
      ok: true,
      status: 204,
      data: {},
    });
  });

  it("keeps the real status when an error page isn't JSON", async () => {
    await expect(
      readUpstreamResponse(upstream(504, "<html>Gateway Timeout</html>")),
    ).resolves.toEqual({
      ok: false,
      status: 504,
      data: { message: "Upstream error (504)" },
    });
  });

  it("reports a non-JSON success body as a 502 instead of passing it on", async () => {
    await expect(
      readUpstreamResponse(upstream(200, "<html>Maintenance</html>")),
    ).resolves.toEqual({
      ok: false,
      status: 502,
      data: { message: "Invalid upstream response", code: "INVALID_RESPONSE" },
    });
  });
});
