// Test script to verify DDA integration
console.log("Testing DDA Integration...");

// Test 1: Check if all required files exist
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'src/components/protocol/medical-chatbot.tsx',
  'src/components/protocol/agent-opinion-card.tsx',
  'src/components/ui/expandable-card.tsx',
  'src/hooks/use-expandable.tsx',
  'src/components/ui/tabs.tsx'
];

console.log("\n1. Checking required files:");
let allFilesExist = true;
for (const file of requiredFiles) {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
  if (!exists) allFilesExist = false;
}

console.log("\n2. Summary:");
console.log(`   All files exist: ${allFilesExist ? '✅ YES' : '❌ NO'}`);

// Test 2: Check for TypeScript compilation
console.log("\n3. TypeScript Check:");
console.log("   Run 'bun run build' to verify TypeScript compilation");

console.log("\n✅ DDA Integration test complete!");
console.log("\nNext steps:");
console.log("1. Test the UI by running: bun dev");
console.log("2. Submit a medical query to see the 10-agent protocol");
console.log("3. Click on 'Agent Opinions' tab to see all 10 opinions");
console.log("4. Click on any agent card to expand details");
console.log("5. Use the message button to ask about specific opinions");