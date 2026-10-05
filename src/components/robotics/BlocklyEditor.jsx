import React, { useEffect, useRef, useState } from 'react';
import * as Blockly from 'blockly/core';
import 'blockly/blocks';
import 'blockly/javascript'; // We use JS generator engine to mock C++ for now to avoid custom generator setup boilerplate
import * as tr from 'blockly/msg/en'; // Using English default to avoid module path issues, can translate later

// Define custom ESP32/Robot blocks with engaging themes
const customBlocks = [
  {
    "type": "robot_move",
    "message0": "🤖 Robot %1 hızında %2",
    "args0": [
      { "type": "field_number", "name": "SPEED", "value": 150, "min": 0, "max": 255 },
      { "type": "field_dropdown", "name": "DIRECTION", "options": [
          ["İleri Git", "FORWARD"], ["Geri Git", "BACKWARD"],
          ["Sola Dön", "LEFT"], ["Sağa Dön", "RIGHT"]
        ]
      }
    ],
    "previousStatement": null, "nextStatement": null,
    "colour": 230, "tooltip": "Robotu hareket ettirir."
  },
  {
    "type": "robot_stop",
    "message0": "🛑 Robotu Durdur",
    "previousStatement": null, "nextStatement": null,
    "colour": 0
  },
  {
    "type": "futbol_sut",
    "message0": "⚽ Topa Şut Çek (Şut Gücü: %1)",
    "args0": [{ "type": "field_number", "name": "POWER", "value": 100, "min": 0, "max": 100 }],
    "previousStatement": null, "nextStatement": null,
    "colour": 120
  },
  {
    "type": "futbol_calim",
    "message0": "🏃‍♂️ Rakibe Çalım At (Yön: %1)",
    "args0": [{ "type": "field_dropdown", "name": "DIR", "options": [["Sola", "LEFT"], ["Sağa", "RIGHT"]] }],
    "previousStatement": null, "nextStatement": null,
    "colour": 120
  },
  {
    "type": "muzik_nota",
    "message0": "🎵 Nota Çal: %1",
    "args0": [{ "type": "field_dropdown", "name": "NOTA", "options": [["Do", "C"], ["Re", "D"], ["Mi", "E"], ["Fa", "F"], ["Sol", "G"]] }],
    "previousStatement": null, "nextStatement": null,
    "colour": 160
  },
  {
    "type": "muzik_siren",
    "message0": "🚨 Polis Sireni Çal",
    "previousStatement": null, "nextStatement": null,
    "colour": 160
  },
  {
    "type": "ai_request",
    "message0": "🧠 OHEP AI: Engeli Nasıl Aşayım?",
    "previousStatement": null, "nextStatement": null,
    "colour": 280
  },
  {
    "type": "ai_trend",
    "message0": "🚀 Gemini AI'a Sor: %1",
    "args0": [{ "type": "field_dropdown", "name": "TOPIC", "options": [["Güncel Futbol Transferleri", "FUTBOL"], ["Bugünün Uzay Haberleri", "UZAY"], ["Oyun Dünyası Trendleri", "OYUN"]] }],
    "previousStatement": null, "nextStatement": null,
    "colour": 280
  }
];

Blockly.defineBlocksWithJsonArray(customBlocks);

// A simple C++ Generator based on the generic generator
const ArduinoGenerator = new Blockly.Generator('Arduino');

ArduinoGenerator['controls_repeat_ext'] = function(block) {
  const times = ArduinoGenerator.valueToCode(block, 'TIMES', ArduinoGenerator.ORDER_NONE) || '0';
  const branch = ArduinoGenerator.statementToCode(block, 'DO');
  return `for (int i = 0; i < ${times}; i++) {\n${branch}}\n`;
};
ArduinoGenerator['math_number'] = function(block) {
  return [block.getFieldValue('NUM'), ArduinoGenerator.ORDER_ATOMIC];
};
ArduinoGenerator['robot_move'] = function(block) {
  return `moveRobot(${block.getFieldValue('DIRECTION')}, ${block.getFieldValue('SPEED')});\n`;
};
ArduinoGenerator['robot_stop'] = function(block) { return `stopRobot();\n`; };
ArduinoGenerator['futbol_sut'] = function(block) { return `kickBall(${block.getFieldValue('POWER')});\n`; };
ArduinoGenerator['futbol_calim'] = function(block) { return `dribble(${block.getFieldValue('DIR')});\n`; };
ArduinoGenerator['muzik_nota'] = function(block) { return `playBuzzer("${block.getFieldValue('NOTA')}");\n`; };
ArduinoGenerator['muzik_siren'] = function(block) { return `playPoliceSiren();\n`; };
ArduinoGenerator['ai_request'] = function(block) { return `askGemini_ObstacleStrategy();\n`; };
ArduinoGenerator['ai_trend'] = function(block) { return `askGemini_Trend("${block.getFieldValue('TOPIC')}");\n`; };

export default function BlocklyEditor() {
  const blocklyDiv = useRef(null);
  const workspace = useRef(null);
  const [generatedCode, setGeneratedCode] = useState('');

  useEffect(() => {
    if (!workspace.current && blocklyDiv.current) {
      workspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: `
          <xml>
            <category name="🤖 ESP32 Sürüş" colour="230">
              <block type="robot_move"></block>
              <block type="robot_stop"></block>
            </category>
            <category name="⚽ Futbol Taktikleri" colour="120">
              <block type="futbol_sut"></block>
              <block type="futbol_calim"></block>
            </category>
            <category name="🎵 DJ & Müzik" colour="160">
              <block type="muzik_nota"></block>
              <block type="muzik_siren"></block>
            </category>
            <category name="🧠 Yapay Zeka (AI)" colour="280">
              <block type="ai_request"></block>
            </category>
            <category name="🚀 Güncel Konular" colour="200">
              <block type="ai_trend"></block>
            </category>
            <category name="⚡ Süper Güçler (Döngü)" colour="330">
              <block type="controls_repeat_ext">
                <value name="TIMES">
                  <block type="math_number">
                    <field name="NUM">3</field>
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
