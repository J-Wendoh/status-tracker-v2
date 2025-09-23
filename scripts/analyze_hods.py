import pandas as pd

# Read the Excel file
df = pd.read_excel('./AG Departmental Tracker.xlsx')
df_clean = df.iloc[2:].copy()
df_clean.columns = ['Department', 'HOD_Name', 'Assistant_Name', 'Phone', 'Email', 'Activities', 'Location', 'ID_Number']

print('HODs FROM EXCEL FILE:')
print('='*60)

# Get unique HODs
hods = df_clean[['HOD_Name', 'Department']].dropna()
hods = hods[hods['HOD_Name'] != 'Name of HOD/ \nDirector of SAGA']
unique_hods = hods.drop_duplicates()

hod_list = []
for _, row in unique_hods.iterrows():
    hod_name = str(row['HOD_Name']).strip()
    dept = str(row['Department']).strip()
    if hod_name and hod_name != 'nan':
        print(f'HOD: {hod_name:30} | Department: {dept}')
        hod_list.append({
            'name': hod_name,
            'department': dept
        })

print('\n\nHODs IDENTIFIED:')
print('='*60)
for i, hod in enumerate(hod_list, 1):
    print(f'{i}. {hod["name"]} - {hod["department"]}')

print(f'\nTotal HODs: {len(hod_list)}')

print('\n\nDETAILED BREAKDOWN:')
print('='*60)

# Group by department
for dept in df_clean['Department'].dropna().unique():
    if dept != 'Department/SAGA':
        dept_data = df_clean[df_clean['Department'] == dept]
        if not dept_data.empty:
            hod = dept_data['HOD_Name'].iloc[0] if not dept_data.empty else 'Unknown'
            assistants = dept_data['Assistant_Name'].dropna().unique()

            print(f'\nDepartment: {dept}')
            print(f'  HOD: {hod}')
            if len(assistants) > 0:
                print(f'  Assistants ({len(assistants)}):')
                for assistant in assistants:
                    print(f'    - {assistant}')