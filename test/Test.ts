import assert from "assert";
import { 
  TestHelpers,
  HappyRedPacket_ClaimSuccessEntity
} from "generated";
const { MockDb, HappyRedPacket } = TestHelpers;

describe("HappyRedPacket contract ClaimSuccess event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for HappyRedPacket contract ClaimSuccess event
  const event = HappyRedPacket.ClaimSuccess.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  // Processing the event
  const mockDbUpdated = HappyRedPacket.ClaimSuccess.processEvent({
    event,
    mockDb,
  });

  it("HappyRedPacket_ClaimSuccessEntity is created correctly", () => {
    // Getting the actual entity from the mock database
    let actualHappyRedPacketClaimSuccessEntity = mockDbUpdated.entities.HappyRedPacket_ClaimSuccess.get(
      `${event.transactionHash}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedHappyRedPacketClaimSuccessEntity: HappyRedPacket_ClaimSuccessEntity = {
      id: `${event.transactionHash}_${event.logIndex}`,
      id: event.params.id,
      claimer: event.params.claimer,
      claimed_value: event.params.claimed_value,
      token_address: event.params.token_address,
      lock: event.params.lock,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualHappyRedPacketClaimSuccessEntity, expectedHappyRedPacketClaimSuccessEntity, "Actual HappyRedPacketClaimSuccessEntity should be the same as the expectedHappyRedPacketClaimSuccessEntity");
  });
});
