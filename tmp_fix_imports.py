import os, glob
for f in glob.glob('api/_logic/*.js'):
    try:
        with open(f, 'r', encoding='utf-8') as r:
            c = r.read()
        if '../_utils.js' in c:
            new_c = c.replace('../_utils.js', './_utils.js')
            with open(f, 'w', encoding='utf-8') as w:
                w.write(new_c)
            print(f"Fixed {f}")
    except Exception as e:
        print(f"Error fixing {f}: {e}")
