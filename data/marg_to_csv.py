#!/usr/bin/env python3
"""
Marg Daily Sales DBF → CSV Converter
Usage: python3 marg_to_csv.py 17032026.dbf
Output: 17032026_summary.csv and 17032026_details.csv
"""
import struct, sys, os, csv
from datetime import datetime

def read_dbf(filepath):
    """Read all records from a Marg daily sales DBF file."""
    with open(filepath, 'rb') as f:
        f.read(1)  # version
        f.read(3)  # date
        nrec = struct.unpack('<I', f.read(4))[0]
        hlen = struct.unpack('<H', f.read(2))[0]
        rlen = struct.unpack('<H', f.read(2))[0]

        # Read field descriptors
        f.seek(32)
        fields = []
        while True:
            fname = f.read(11)
            if fname[0:1] == b'\r':
                break
            ftype = f.read(1).decode()
            f.read(4)
            flen = struct.unpack('B', f.read(1))[0]
            f.read(1)  # decimal
            f.read(14)
            fields.append((fname.replace(b'\x00', b'').decode().strip(), flen))

        # Read records
        f.seek(hlen)
        records = []
        for _ in range(nrec):
            rec = f.read(rlen)
            if not rec:
                break
            pos = 1
            row = {}
            for name, length in fields:
                row[name] = rec[pos:pos+length].decode('latin-1', errors='replace').strip()
                pos += length
            records.append(row)
    return records

def parse_sales(records):
    """Parse Marg records into structured bill data."""
    date_str = ""
    bills = []
    current_bill = None
    day_total = None

    for rec in records:
        billno = rec.get('BILLNO', '').strip()
        desc = rec.get('DESCRIPTIO', '').strip()
        dr = rec.get('DR', '').strip()
        gross = rec.get('GROSSAMT', '').strip()
        disc = rec.get('DISCOUNT', '').strip()
        tax = rec.get('TAX', '').strip()
        net = rec.get('NETAMT', '').strip()
        cash = rec.get('CASH', '').strip()

        # Date row (first record)
        if billno and not desc and not gross:
            date_str = billno
            continue

        # Day total / grand total rows
        if 'DAY TOTAL' in dr or 'GRAND TOTAL' in dr:
            day_total = {
                'gross': gross, 'discount': disc,
                'tax': tax, 'net': net, 'cash': cash
            }
            if 'GRAND TOTAL' in dr:
                # Also capture bill count from this row
                if 'Bills:' in desc:
                    day_total['bill_count'] = desc.replace('Bills:', '').strip()
            continue

        # Bill header row (has a bill number and CASH/CREDIT in description)
        if billno and billno[0].isdigit() and len(billno) >= 5:
            if current_bill:
                bills.append(current_bill)
            current_bill = {
                'bill_no': billno,
                'type': desc,
                'customer': dr.replace('#', '').strip(),
                'gross': gross,
                'discount': disc,
                'tax': tax,
                'net': net,
                'cash': cash,
                'items': []
            }
            continue

        # Item detail row (description starts with item number)
        if desc and current_bill:
            # Parse item: "1  47 SARIDON TAB          1*10"
            parts = desc.split()
            if parts and parts[0].isdigit():
                item = {
                    'item_name': desc,
                    'batch': disc,  # batch number stored in discount column
                    'price_expiry': gross  # price and expiry stored in gross column
                }
                current_bill['items'].append(item)
            continue

    if current_bill:
        bills.append(current_bill)

    return date_str, bills, day_total

def write_csvs(filepath, date_str, bills, day_total):
    """Write summary and detail CSVs."""
    base = os.path.splitext(filepath)[0]

    # --- Summary CSV (one row per bill + totals) ---
    summary_file = f"{base}_summary.csv"
    with open(summary_file, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['Date', 'Bill No', 'Type', 'Items', 'Gross (₹)', 'Discount (₹)', 'Tax (₹)', 'Net (₹)'])
        for bill in bills:
            item_names = '; '.join([i['item_name'].strip() for i in bill['items']])
            w.writerow([
                date_str, bill['bill_no'], bill['type'],
                item_names,
                bill['gross'], bill['discount'], bill['tax'], bill['net']
            ])
        # Day total row
        if day_total:
            w.writerow([])
            w.writerow([
                date_str, 'DAY TOTAL', f"{len(bills)} bills", '',
                day_total['gross'], day_total['discount'],
                day_total['tax'], day_total['net']
            ])
    print(f"✅ Summary: {summary_file}")

    # --- Details CSV (one row per item) ---
    details_file = f"{base}_details.csv"
    with open(details_file, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['Date', 'Bill No', 'Item', 'Batch', 'Price/Expiry'])
        for bill in bills:
            for item in bill['items']:
                w.writerow([
                    date_str, bill['bill_no'],
                    item['item_name'].strip(),
                    item['batch'],
                    item['price_expiry']
                ])
    print(f"✅ Details: {details_file}")

    # Print quick summary to terminal
    print(f"\n📊 {date_str} — {len(bills)} bills")
    print(f"   Gross:    ₹{day_total['gross']}" if day_total else "")
    print(f"   Discount: ₹{day_total['discount']}" if day_total else "")
    print(f"   Tax:      ₹{day_total['tax']}" if day_total else "")
    print(f"   Net:      ₹{day_total['net']}" if day_total else "")

    return summary_file, details_file

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python3 marg_to_csv.py <file.dbf>")
        sys.exit(1)

    filepath = sys.argv[1]
    if not os.path.exists(filepath):
        print(f"❌ File not found: {filepath}")
        sys.exit(1)

    records = read_dbf(filepath)
    date_str, bills, day_total = parse_sales(records)
    write_csvs(filepath, date_str, bills, day_total)
