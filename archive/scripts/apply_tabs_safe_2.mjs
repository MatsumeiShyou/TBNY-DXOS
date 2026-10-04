import fs from 'fs';
let code = fs.readFileSync('src/components/CustomerScheduleGridModal.tsx', 'utf8');

const endRegex = /<\/tbody>\s*<\/table>\s*\{filteredCustomers\.length === 0 && \(/;

const replacementTableEnd = `              </tbody>
            </table>
            )}

            {activeTab === 'basic' && (
              <table className="min-w-full divide-y divide-gray-300 table-fixed">
                <thead className="bg-gray-200 sticky -top-[1px] z-30 shadow-sm border-t border-gray-300">
                  <tr>
                    <th className="sticky left-0 z-40 bg-gray-200 py-3 pl-4 pr-3 text-left text-xs font-semibold text-gray-700 w-48 border-r border-gray-300 shadow-[1px_0_0_0_#d1d5db]">
                      顧客名
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-300 w-48">フリガナ</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-300 w-32">エリア</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 border-r border-gray-300 w-40">必須車両</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-300 w-24">所要時間(分)</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-r border-gray-300 w-24">祝日回収</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 w-24">停止中</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="hover:bg-emerald-50/50 group">
                      <td className="sticky left-0 z-10 bg-white group-hover:bg-emerald-50/50 py-2 pl-4 pr-3 text-sm font-bold text-gray-800 border-r border-gray-200 shadow-[1px_0_0_0_#e5e7eb]">
                        {customer.name}
                      </td>
                      <td className="px-2 py-1 border-r border-gray-200">
                        <input 
                          type="text" 
                          className="w-full border border-transparent hover:border-gray-300 focus:border-emerald-500 rounded px-2 py-1 text-xs outline-none"
                          value={customer.kana || ''}
                          onChange={e => setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, kana: e.target.value} : c))}
                        />
                      </td>
                      <td className="px-2 py-1 border-r border-gray-200">
                        <input 
                          type="text" 
                          className="w-full border border-transparent hover:border-gray-300 focus:border-emerald-500 rounded px-2 py-1 text-xs outline-none"
                          value={customer.area || ''}
                          onChange={e => setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, area: e.target.value} : c))}
                        />
                      </td>
                      <td className="px-2 py-1 border-r border-gray-200">
                        <select 
                          className="w-full border border-transparent hover:border-gray-300 focus:border-emerald-500 rounded px-1 py-1 text-xs outline-none"
                          value={customer.requiredVehicle || ''}
                          onChange={e => setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, requiredVehicle: e.target.value} : c))}
                        >
                          <option value="">(指定なし)</option>
                          {masterVehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-1 border-r border-gray-200">
                        <input 
                          type="number" 
                          className="w-full border border-transparent hover:border-gray-300 focus:border-emerald-500 rounded px-2 py-1 text-xs outline-none text-center"
                          value={customer.defaultDuration || 0}
                          onChange={e => setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, defaultDuration: parseInt(e.target.value) || 0} : c))}
                        />
                      </td>
                      <td className="px-2 py-1 border-r border-gray-200 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                          checked={!!customer.holidayCollection}
                          onChange={e => setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, holidayCollection: e.target.checked} : c))}
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <input 
                          type="checkbox" 
                          className="rounded text-red-500 focus:ring-red-500 cursor-pointer"
                          checked={!!customer.isInvalid}
                          onChange={e => setLocalCustomers(prev => prev.map(c => c.id === customer.id ? {...c, isInvalid: e.target.checked} : c))}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {filteredCustomers.length === 0 && (`;

code = code.replace(endRegex, replacementTableEnd);

fs.writeFileSync('src/components/CustomerScheduleGridModal.tsx', code, 'utf8');
