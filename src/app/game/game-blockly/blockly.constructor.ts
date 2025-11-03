import * as Blockly from 'blockly/core';
import { javascriptGenerator, Order } from 'blockly/javascript';

export function defineBlocks() {
  Blockly.Blocks['dev_task'] = {
    init: function () {
      this.appendDummyInput()
        .appendField('Codar')
        .appendField(new Blockly.FieldNumber(1), 'task_value');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Fazer Task');
      this.setHelpUrl('');
      this.setColour(315);
    },
  };
  Blockly.Blocks['dev_stamina_check'] = {
    init: function () {
      this.appendDummyInput('task_value')
        .appendField('Stamina <')
        .appendField(new Blockly.FieldNumber(0), 'less_than');
      this.setOutput(true, 'Boolean');
      this.setTooltip('stamina value');
      this.setHelpUrl('');
      this.setColour(315);
    },
  };
  Blockly.Blocks['dev_coffee'] = {
    init: function () {
      this.appendDummyInput().appendField('Café ☕');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setTooltip('Tomar Café');
      this.setHelpUrl('');
      this.setColour(315);
    },
  };

  javascriptGenerator.forBlock['dev_stamina_check'] = function (block) {
    const number_less_than = block.getFieldValue('less_than');
    console.log(
      `Stamina check: this.getStamina() < ${number_less_than}`);
    const code = `getStamina() < ${number_less_than}`;
    return [code, Order.NONE];
  };

  javascriptGenerator.forBlock['dev_task'] = function (block) {
    const number_task_value = block.getFieldValue('task_value');
    console.log(`Task value: ${number_task_value}`);
    const code = `fazerTask(${number_task_value}, this);`;
    return code;
  };

  javascriptGenerator.forBlock['dev_coffee'] = function () {
    const code = `tomarCafe(this);`;
    return code;
  };
}



