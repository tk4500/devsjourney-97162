// Represents a custom block definition, stored in 'customBlocks/{blockName}' in Firestore
export interface CustomBlock {
  // A stringified JSON object following Blockly's JSON block definition format.
  jsonDefinition: string;

  // A string containing the body of the JavaScript generator function for this block.
  generatorStub: string;
}
