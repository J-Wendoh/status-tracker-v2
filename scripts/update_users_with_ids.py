import pandas as pd
import numpy as np

# Read the Excel file
df = pd.read_excel('./AG Departmental Tracker.xlsx')
df_clean = df.iloc[2:].copy()
df_clean.columns = ['Department', 'HOD_Name', 'Assistant_Name', 'Phone', 'Email', 'Activities', 'Location', 'ID_Number']

print('Users WITH ID Numbers:')
print('='*60)
users_with_ids = []
for _, row in df_clean.iterrows():
    if pd.notna(row['Assistant_Name']) and pd.notna(row['Email']) and pd.notna(row['ID_Number']) and row['ID_Number'] != 0:
        try:
            id_num = str(int(row['ID_Number']))
            print(f'✓ {row["Assistant_Name"]:30} | ID: {id_num:10} | {row["Email"]}')
            print(f'  Password: ke.{id_num}.AG')
            users_with_ids.append({
                'name': row['Assistant_Name'],
                'email': row['Email'],
                'id': id_num,
                'department': row['Department']
            })
        except:
            pass

print(f'\nTotal users with IDs: {len(users_with_ids)}')

print('\n\nUsers WITHOUT ID Numbers (will NOT be created):')
print('='*60)
for _, row in df_clean.iterrows():
    if pd.notna(row['Assistant_Name']) and pd.notna(row['Email']):
        if pd.isna(row['ID_Number']) or row['ID_Number'] == 0:
            print(f'✗ {row["Assistant_Name"]:30} | {row["Email"]}')

# Show first 3 test accounts
print('\n\n📝 THREE TEST ACCOUNTS:')
print('='*60)
for i, user in enumerate(users_with_ids[:3], 1):
    print(f'\nAccount {i}:')
    print(f'  Name: {user["name"]}')
    print(f'  Email: {user["email"]}')
    print(f'  Password: ke.{user["id"]}.AG')
    print(f'  Department: {user["department"]}')