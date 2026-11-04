# CMU 사전 → data/ipa.json (미국식 발음기호). pip install eng_to_ipa 필요(사전 파일만 사용)
import json, re, os, eng_to_ipa
d = json.load(open(os.path.dirname(eng_to_ipa.__file__) + '/resources/CMU_dict.json'))
M = dict(aa='ɑ', ae='æ', ah='ʌ', ao='ɔ', aw='aʊ', ay='aɪ', b='b', ch='tʃ', d='d', dh='ð', eh='ɛ', er='ɝ', ey='eɪ', f='f', g='g',
         hh='h', ih='ɪ', iy='i', jh='dʒ', k='k', l='l', m='m', n='n', ng='ŋ', ow='oʊ', oy='ɔɪ', p='p', r='r', s='s', sh='ʃ',
         t='t', th='θ', uh='ʊ', uw='u', v='v', w='w', y='j', z='z', zh='ʒ')
VOW = {'aa','ae','ah','ao','aw','ay','eh','er','ey','ih','iy','ow','oy','uh','uw'}
CL2 = {('p','l'),('p','r'),('b','l'),('b','r'),('t','r'),('d','r'),('k','l'),('k','r'),('g','l'),('g','r'),('f','l'),('f','r'),('th','r'),('sh','r'),
       ('s','p'),('s','t'),('s','k'),('s','l'),('s','m'),('s','n'),('s','w'),('t','w'),('k','w'),('d','w'),('th','w'),('hh','y'),('p','y'),('b','y'),('k','y'),('f','y'),('m','y'),('n','y'),('t','y'),('d','y'),('s','y'),('v','y'),('l','y')}
def sym(b, st):
    if b == 'ah': return 'ʌ' if st == '1' else 'ə'
    if b == 'er': return 'ɝ' if st == '1' else 'ɚ'
    return M[b]
def conv(pron):
    toks = []
    for ph in pron.split():
        m = re.fullmatch(r'([a-z]+)(\d?)', ph)
        toks.append((m.group(1), m.group(2)))
    marks = {}  # index -> mark inserted before token index
    for i, (b, st) in enumerate(toks):
        if b in VOW and st in ('1', '2'):
            j = i
            if j > 0 and toks[j-1][0] not in VOW:
                j -= 1
                if j > 0 and toks[j-1][0] not in VOW and (toks[j-1][0], toks[j][0]) in CL2:
                    j -= 1
                    if j > 0 and toks[j-1][0] == 's' and toks[j][0] in ('p','t','k') and toks[j-1][0] not in VOW:
                        j -= 1
            marks[j] = 'ˈ' if st == '1' else 'ˌ'
    out = ''
    for i, (b, st) in enumerate(toks):
        out += marks.get(i, '') + sym(b, st)
    return out
out = {}
for w, prons in d.items():
    if re.fullmatch(r"[a-z]+", w) and prons:
        out[w] = conv(prons[0])
json.dump(out, open(os.path.join(os.path.dirname(__file__), '../../data/ipa.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(len(out))
