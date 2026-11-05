import re,sys
s=open(sys.argv[1]).read()
s=re.sub(r'\{([^{}|]+)\|([^{}|]+)\}', r'<ruby>\1<rp aria-hidden="true">(</rp><rt aria-hidden="true">\2</rt><rp aria-hidden="true">)</rp></ruby>', s)
open(sys.argv[2],'w').write(s)
