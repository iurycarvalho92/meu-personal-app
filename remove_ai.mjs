import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf-8');

const removeBetween = (startStr, endStr) => {
  const s = code.indexOf(startStr);
  if (s === -1) return;
  const e = code.indexOf(endStr, s);
  if (e === -1) return;
  code = code.slice(0, s) + code.slice(e);
};

// 1. Remove Gemini Setup
removeBetween('// --- Gemini API Setup ---', '// --- Data Constants ---');

// 2. Remove AI state variables
code = code.replace(/  const \[aiLoading.*?;\n/g, '');
code = code.replace(/  const \[aiPlannerLoading.*?;\n/g, '');
code = code.replace(/  const \[aiCalendarLoading.*?;\n/g, '');
code = code.replace(/  const \[bonusAiLoading.*?;\n/g, '');
code = code.replace(/  const \[aiInsight.*?;\n/g, '');
code = code.replace(/  const \[calendarSuggestion.*?;\n/g, '');
code = code.replace(/  const \[swapLoadingIdx.*?;\n/g, '');

// 3. Remove from handleLogout and finishWorkout
code = code.replace(/    setAiInsight\(""\);\n/g, '');
code = code.replace(/    setCalendarSuggestion\(""\);\n/g, '');
code = code.replace(/    setAiInsight\(""\); \/\/ Clear insight to trigger new tip\n/g, '');

// 4. Remove AI Actions block
removeBetween('  // --- AI Actions ---', '  // --- Base Actions ---');

// 5. Dashboard Insight box
removeBetween('<div className="mt-6 p-4 bg-gradient-to-br from-blue-600 to-indigo-700', '</header>');

// 6. Planner Auto-Planejar IA button
removeBetween('<button \n              onClick={generateAiWeeklyPlan}', '</button>\n          </div>');
// Add back the closing div
code = code.replace('<div className="flex justify-between items-start mb-2">\n            <h2 className="text-xl font-bold text-gray-800">Cronograma Semanal</h2>\n            </button>\n          </div>', '<div className="flex justify-between items-start mb-2">\n            <h2 className="text-xl font-bold text-gray-800">Cronograma Semanal</h2>\n          </div>');

// 7. Planner text fix
code = code.replace('Agende os seus treinos da semana de acordo com a sua disponibilidade, ou peça à IA para distribuir 2 sessões otimizadas.', 'Agende os seus treinos da semana de acordo com a sua disponibilidade.');

// 8. AI Customization block in planner
removeBetween('{/* AI Customization */}', '      </div>\n    );\n  };\n\n  const renderWorkoutLogger');

// 9. WorkoutLogger Swap button
removeBetween('<button \n                      onClick={() => swapExercise(idx)}', '</button>\n                  </div>');
code = code.replace('<h3 className="font-bold text-gray-800 text-lg leading-tight">{ex.name}</h3>\n                    </button>\n                  </div>', '<h3 className="font-bold text-gray-800 text-lg leading-tight">{ex.name}</h3>\n                  </div>');

// 10. WorkoutLogger Bonus badge
removeBetween('{ex.isBonus && (', ')}\n            </div>');
code = code.replace(')}\n            </div>', '            </div>');

// 11. WorkoutLogger Bonus button
removeBetween('<div className="flex justify-center mt-6 mb-8">', '<div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-24">');

// 12. History AI button
removeBetween('<button \n            onClick={analyzeProgress}', '</button>\n        </div>');
code = code.replace('<h2 className="text-xl font-bold text-gray-800">Evolução</h2>\n          </button>\n        </div>', '<h2 className="text-xl font-bold text-gray-800">Evolução</h2>\n        </div>');

// 13. History AI Insight block
removeBetween('{aiInsight && activeTab === \'history\' && (', ')}\n        \n        {workoutLogs');
code = code.replace(')}\n        \n        {workoutLogs', '        {workoutLogs');

// 14. Calendar AI Suggestion Card
removeBetween('{/* AI Suggestion Card */}', '<div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">');

fs.writeFileSync('src/App.jsx', code);
console.log('Success');
