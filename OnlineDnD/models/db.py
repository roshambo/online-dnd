db = DAL("sqlite://storage.sqlite")

from gluon.tools import Auth
auth = Auth(db)
auth.define_tables(username=True)

auth.define_tables(username=False, signature=False)

auth.settings.registration_requires_verification = False
auth.settings.registration_requires_approval = False
auth.settings.reset_password_requires_verification = True

db.define_table('chat',
        Field('me_from'),
        Field('me_body', 'text'),
        Field('me_html', 'text'),
        )

db.define_table('image',
   Field('x', default=10),
   Field('y', default=10),
   Field('title', default="Enter Username!"),
   #Field('player_id', 'reference auth_user', default=auth.user_id),
   format = '%(title)s')

db.define_table('charCore',
        Field('title', default="Enter Username!"),
        Field('pname'),
        Field('cname'),
        Field('STR', 'integer', default=0),
        Field('DEX', 'integer', default=0),
        Field('CON', 'integer', default=0),
        Field('INT', 'integer', default=0),
        Field('WIS', 'integer', default=0),
        Field('CHA', 'integer', default=0),
        Field('HP', 'integer', default=0),
        Field('MAXHP', 'integer', default=0))

db.define_table('charAttack',
        Field('title', default="Enter Username!"),
        Field('BAB', 'integer', default=0),
        Field('MAB', 'integer', default=0),
        Field('RAB', 'integer', default=0),
        Field('CMB', 'integer', default=0),
        Field('MeleeDMG', 'integer', default=0),
        Field('RangedDMG', 'integer', default=0),)

db.define_table('charDefense',
        Field('title', default="Enter Username!"),
        Field('AC', 'integer', default=0),
        Field('TAC', 'integer', default=0),
        Field('FFAC', 'integer', default=0),
        Field('CMD', 'integer', default=0),
        Field('FFCMD', 'integer', default=0),
        Field('SpellRes', 'integer', default=0),
        Field('ReflexSave', 'integer', default=0),
        Field('FortitudeSave', 'integer', default=0),
        Field('WillSave', 'integer', default=0),
        Field('DMGReduction', 'integer', default=0),)

db.define_table('charSkills',
        Field('title', default="Enter Username!"),
        Field('UseSkill', 'integer', default=0),)

db.define_table('charFeats',
        Field('title', default="Enter Username!"),
        Field('Feat1', 'integer', default=0),
        Field('Feat2', 'integer', default=0),
        Field('Feat3', 'integer', default=0),
        Field('Feat4', 'integer', default=0),
        Field('Feat5', 'integer', default=0),
        Field('Feat6', 'integer', default=0),
        Field('Feat7', 'integer', default=0),
        Field('Feat8', 'integer', default=0),
        Field('Feat9', 'integer', default=0),
        Field('Feat10', 'integer', default=0),)

db.define_table('post',
   Field('image_id', 'reference image'),
   Field('author'),
   Field('email'),
   Field('body', 'text'))

db.define_table('playerImage',
   Field('file', 'upload'))

db.define_table('board',
   Field('x_length'),
   Field('y_length'))

db.define_table('npc',
   Field('x1'),
   Field('y1'),
   Field('name1'),
   Field('x2'),
   Field('y2'),
   Field('name2'),
   Field('x3'),
   Field('y3'),
   Field('name3'),
   Field('x4'),
   Field('y4'),
   Field('name4'),
   Field('x5'),
   Field('y5'),
   Field('name5'),
   Field('x6'),
   Field('y6'),
   Field('name6'),
   Field('x7'),
   Field('y7'),
   Field('name7'),
   Field('x8'),
   Field('y8'),
   Field('name8'))

db.define_table('color',
   Field('r'),
   Field('g'),
   Field('b'))

db.color.r.requires = IS_INT_IN_RANGE(0, 25)
db.color.g.requires = IS_INT_IN_RANGE(0, 25)
db.color.b.requires = IS_INT_IN_RANGE(0, 25)

db.npc.x1.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.y1.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.x2.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.y2.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.x3.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.y3.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.x4.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.y4.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.x5.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.y5.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.x6.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.y6.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.x7.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.y7.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.x8.requires = IS_INT_IN_RANGE(-1, 26)
db.npc.y8.requires = IS_INT_IN_RANGE(-1, 26)

db.board.x_length.requires = IS_INT_IN_RANGE(1, 26)
db.board.y_length.requires = IS_INT_IN_RANGE(1, 26)

db.image.x.requires = IS_INT_IN_RANGE(0, 26)
db.image.y.requires = IS_INT_IN_RANGE(0, 26)
#db.image.title.writable = False

db.post.image_id.writable = db.post.image_id.readable = False