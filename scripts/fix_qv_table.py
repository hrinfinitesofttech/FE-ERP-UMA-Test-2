import os

path = r'D:\UMA ERP\ERP-Test-1\src\app\purchase\quotation-verify\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find start of the thead ths
start_idx = None
end_idx = None
for i, l in enumerate(lines):
    if '<th className="p-3">Tata Steel</th>' in l:
        start_idx = i - 1 # <th className="p-3 text-center">Req Qty</th>
    if '+₹{itemSaving.toLocaleString' in l:
        # find the end of this tr/tbody
        for j in range(i, len(lines)):
            if '</tbody>' in lines[j]:
                end_idx = j - 1
                break
        break

if start_idx is not None and end_idx is not None:
    print(f"Replacing lines {start_idx} to {end_idx}")
    new_chunk = """                <th className="p-3 text-center">Req Qty</th>
                {vendorQuotes.map((vq) => (
                  <th
                    key={vq.id}
                    className={`p-3 ${vq.isL1 ? 'bg-emerald-50/70 border-x border-emerald-200 text-emerald-900 font-extrabold' : ''}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{vq.vendorName}</span>
                      {vq.isL1 && <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[9px]">L1</span>}
                    </div>
                  </th>
                ))}
                <th className="p-3 text-right">L1 Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBE3DB]">
              {vendorQuotes[0]?.items?.map((it, idx) => {
                const l1Quote = vendorQuotes.find((q) => q.isL1) || vendorQuotes[0];
                const l1Rate = l1Quote?.items[idx]?.unitRate || 0;
                const rates = vendorQuotes.map((q) => q.items[idx]?.unitRate || 0);
                const maxRate = rates.length > 0 ? Math.max(...rates) : 0;
                const itemSaving = Math.max(0, (maxRate - l1Rate) * it.quantity);

                return (
                  <tr key={it.itemCode} className="hover:bg-[#FAF7F2]/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-[#211B17]">{it.itemName}</div>
                      <div className="text-[10px] font-mono text-[#70665F] mt-0.5">{it.itemCode}</div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-[#211B17]">
                      {it.quantity} {it.uom}
                    </td>

                    {vendorQuotes.map((vq) => {
                      const rate = vq.items[idx]?.unitRate || 0;
                      return (
                        <td
                          key={vq.id}
                          className={`p-3 font-mono ${vq.isL1 ? 'bg-emerald-50/70 border-x border-emerald-200' : ''}`}
                        >
                          <div className={`font-bold ${vq.isL1 ? 'text-emerald-800 flex items-center gap-1 font-black' : 'text-[#211B17]'}`}>
                            <span>₹{rate} /{it.uom}</span>
                            {vq.isL1 && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          </div>
                          <div className={`text-[10px] ${vq.isL1 ? 'text-emerald-700 font-bold' : 'text-[#70665F]'}`}>
                            Total: ₹{rate * it.quantity}
                          </div>
                        </td>
                      );
                    })}

                    <td className="p-3 text-right font-mono font-bold text-emerald-700">
                      +₹{itemSaving.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
"""
    lines[start_idx:end_idx+1] = [new_chunk + '\n']
    content = "".join(lines)
    content = content.replace('{lowestVendor.vendorName}', '{lowestVendor?.vendorName || "—"}')
    content = content.replace('({lowestVendor.quoteNumber})', '({lowestVendor?.quoteNumber || "—"})')
    content = content.replace('setAcceptedVendorId(lowestVendor.id);', 'if (lowestVendor) setAcceptedVendorId(lowestVendor.id);')
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("SUCCESSFULLY APPLIED")
else:
    print(f"Could not find indices: {start_idx}, {end_idx}")
