import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript'; // We use JS generator engine to mock C++ for now to avoid custom generator setup boilerplate
import * as tr from 'blockly/msg/en'; // Using English default to avoid module path issues, can translate later

// Define custom ESP32/Robot blocks
const customBlocks = [
  {
    "type": "robot_move",
    "message0": "Robot %1 hızında %2",
    "args0": [
      { "type": "field_number", "name": "SPEED", "value": 150, "min": 0, "max": 255 },
      { "type": "field_dropdown", "name": "DIRECTION", "options": [
          ["İleri Git", "FORWARD"],
          ["Geri Git", "BACKWARD"],
          ["Sola Dön", "LEFT"],
          ["Sağa Dön", "RIGHT"]
        ]
      }
    ],
    "previousStatement": null,
    "nextStatement": null,
    "colour": 230,
    "tooltip": "Robotu hareket ettirir.",
    "helpUrl": ""
  },
  {
    "type": "robot_stop",
    "message0": "Robotu Durdur",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 0,
    "tooltip": "Tüm motorları durdurur.",
    "helpUrl": ""
  },
  {
    "type": "ai_request",
    "message0": "OHEP Yapay Zeka ile Engel Kontrolü",
    "previousStatement": null,
    "nextStatement": null,
    "colour": 280,
    "tooltip": "Ultrasonik sensör verisini Wi-Fi ile Gemini'ye yollar.",
    "helpUrl": ""
  }
];

Blockly.defineBlocksWithJsonArray(customBlocks);

// A simple C++ Generator based on the generic generator
const ArduinoGenerator = new Blockly.Generator('Arduino');

// Standard block generators for Arduino
ArduinoGenerator['controls_repeat_ext'] = function(block) {
  const times = ArduinoGenerator.valueToCode(block, 'TIMES', ArduinoGenerator.ORDER_NONE) || '0';
  const branch = ArduinoGenerator.statementToCode(block, 'DO');
  return `for (int count = 0; count < ${times}; count++) {\n${branch}}\n`;
};

ArduinoGenerator['math_number'] = function(block) {
  return [block.getFieldValue('NUM'), ArduinoGenerator.ORDER_ATOMIC];
};

ArduinoGenerator['robot_move'] = function(block) {
  const speed = block.getFieldValue('SPEED');
  const dir = block.getFieldValue('DIRECTION');
  return `moveRobot(${dir}, ${speed});\n`;
};

ArduinoGenerator['robot_stop'] = function(block) {
  return `stopRobot();\n`;
};

ArduinoGenerator['ai_request'] = function(block) {
  return `askAI_Obstacle();\n`;
};

export default function BlocklyEditor() {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    if (!workspace.current && blocklyDiv.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: `
          <xml>
            <category name="Robot (ESP32)" colour="230">
              <block type="robot_move"></block>
              <block type="robot_stop"></block>
              <block type="ai_request"></block>
            </category>
            <category name="Döngüler" colour="120">
              <block type="controls_repeat_ext">
                <value name="TIMES">
                  <block type="math_number">
                    <field name="NUM">10</field>
                  </block>
                </value>
              </block>
            </category>
          </xml>
        `
      });

      workspace.current.addChangeListener(() => {
        const code = ArduinoGenerator.workspaceToCode(workspace.current);
        setGeneratedCode(code);
      });
    }
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-120px)] p-4">
      {/* Blockly Workspace */}
      <div className="flex-1 border-2 border-indigo-500/30 rounded-2xl overflow-hidden shadow-2xl relative">
        <div ref={blocklyDiv} className="absolute inset-0"></div>
      </div>
      
      {/* Code Viewer & Serial Flash */}
      <div className="w-full md:w-[400px] bg-slate-900 border-2 border-slate-800 rounded-2xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <h3 className="text-white font-black text-xl mb-4 flex items-center gap-3">
          <span>⚙️</span> C++ (Arduino) Kodu
        </h3>
        
        <div className="flex-1 bg-black/60 border border-white/5 rounded-xl p-4 overflow-auto relative group">
          <pre className="text-emerald-400 font-mono text-sm leading-relaxed">
{`void setup() {
  Serial.begin(115200);
  setupMotors();
  connectWiFi();
}

void loop() {
${generatedCode.split('\\n').map(line => line ? '  ' + line : '').join('\\n')}
}`}
          </pre>
        </div>

        <button 
          onClick={() => alert("Web Serial API ile ESP32'ye bağlanılıyor... (Yakında eklenecek)")}
          className="mt-6 w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-3"
        >
          <span>🚀</span> USB ile Robota Yükle
        </button>
      </div>
    </div>
  );
}
