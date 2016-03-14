import chats

@auth.requires_login()
def index():
    grid = SQLFORM.smartgrid(db.image,linked_tables=['post'],deletable=False,csv=False,create=False,searchable=False)
    return dict(grid=grid)
    #images = db().select(db.image.ALL, orderby=db.image.title)
    #return dict(images=images)

@auth.requires_login()
def user_items():
    query=db.image.title==session.auth.user.username
    grid = SQLFORM.smartgrid(db.image,constraints = dict(image=query),linked_tables=['post'],deletable=True,field_id=None,csv=False,create=False,searchable=False)
    #grid = SQLFORM.smartgrid(db.image,linked_tables=['post'],deletable=True,field_id=None,csv=False,create=False)
    return dict(grid=grid)

@auth.requires_login()
def post_item():
    canPost = True
    form = SQLFORM(db.image)
    form.vars.title = session.auth.user.username;
    if form.vars.title == session.auth.user.username:
        for row in db().select(db.image.ALL):
            if form.vars.title == row.title:
                canPost = False
        if canPost:
            if form.process().accepted:
                response.flash = 'your item is posted'
        else:
            response.flash = 'your character is already on the board'
    else:
        response.flash = 'please insert your login username'
            
    canPost = True
    form2 = SQLFORM(db.charCore)
    form2.vars.title = session.auth.user.username;
    if form2.vars.title == session.auth.user.username:
        for row in db().select(db.charCore.ALL):
            if form2.vars.title == row.title:
                canPost = False
        if canPost:
            if form2.process().accepted:
                response.flash = 'your character sheet is posted'
        else:
            response.flash = 'your character sheet is already posted'
    else:
            response.flash = 'please insert your login username'

    canPost = True
    form3 = SQLFORM(db.charAttack)
    form3.vars.title = session.auth.user.username;
    if form3.vars.title == session.auth.user.username:
        for row in db().select(db.charAttack.ALL):
            if form3.vars.title == row.title:
                canPost = False
        if canPost:
            if form3.process().accepted:
                response.flash = 'your character sheet is posted'
        else:
            response.flash = 'your character sheet is already posted'
    else:
            response.flash = 'please insert your login username'

    canPost = True
    form4 = SQLFORM(db.charDefense)
    form4.vars.title = session.auth.user.username;
    if form4.vars.title == session.auth.user.username:
        for row in db().select(db.charDefense.ALL):
            if form4.vars.title == row.title:
                canPost = False
        if canPost:
            if form4.process().accepted:
                response.flash = 'your character sheet is posted'
        else:
            response.flash = 'your character sheet is already posted'
    else:
            response.flash = 'please insert your login username'

    canPost = True
    form5 = SQLFORM(db.charSkills)
    form5.vars.title = session.auth.user.username;
    if form5.vars.title == session.auth.user.username:
        for row in db().select(db.charSkills.ALL):
            if form5.vars.title == row.title:
                canPost = False
        if canPost:
            if form5.process().accepted:
                response.flash = 'your character sheet is posted'
        else:
            response.flash = 'your character sheet is already posted'
    else:
            response.flash = 'please insert your login username'

    canPost = True
    form6 = SQLFORM(db.charFeats)
    form6.vars.title = session.auth.user.username;
    if form6.vars.title == session.auth.user.username:
        for row in db().select(db.charFeats.ALL):
            if form6.vars.title == row.title:
                canPost = False
        if canPost:
            if form6.process().accepted:
                response.flash = 'your character sheet is posted'
        else:
            response.flash = 'your character sheet is already posted'
    else:
            response.flash = 'please insert your login username'

    return dict(form=form, form2=form2, form3=form3, form4=form4, form5=form5, form6=form6)

@auth.requires_login()
def download():
    return response.download(request, db)

def user():
    return dict(form=auth())

def DnD_Tool():
    return chats.index(db)

def message_new():
    return chats.message_new(db)

def message_updates():
    # need to unlock the session when using
    # session file, should not be need it when
    # using session in db, or in a cookie
    session._unlock(response)
    return chats.message_updates(db)

import json
def getData():
    rows = dict(data=db().select(db.image.ALL))
    return rows

def getBoardData():
    rows = dict(data=db().select(db.board.ALL))
    return rows

def getNPCData():
    rows = dict(data=db().select(db.npc.ALL))
    return rows

def getColorData():
    rows = dict(data=db().select(db.color.ALL))
    return rows

@auth.requires_membership('Manager')
def board_data():
    grid = SQLFORM.smartgrid(db.board,linked_tables=['post'],deletable=False,field_id=None,csv=False,create=False)
    return dict(grid=grid)

@auth.requires_login()
def editForm():
    i = 0
    for row in db().select(db.image.ALL):
        if(session.auth.user.username == row.title):
            form = SQLFORM(db.image, db.image(row.id))
            i = i + 1
    if(i > 0):
        if request.vars.title == session.auth.user.username:
            if form.process().accepted:
                response.flash = 'form accepted'
            elif form.errors:
                response.flash = 'form has errors'
            else:
                response.flash = 'out of range'
        else:
            response.flash = 'you cannot edit your username'
        return dict(form=form)
    else:
        return dict(form="Create a character to play!")

def editCharCore():
    i = 0
    for row in db().select(db.charCore.ALL):
        if(session.auth.user.username == row.title):
            form = SQLFORM(db.charCore, db.charCore(row.id))
            i = i + 1
    if(i > 0):
        if request.vars.title == session.auth.user.username:
            if form.process().accepted:
                response.flash = 'form accepted'
            elif form.errors:
                response.flash = 'form has errors'
            else:
                response.flash = 'out of range'
        else:
            response.flash = 'you cannot edit your username'
        return dict(form=form)
    else:
        return dict(form="Go to the create character tab")

def editCharDefense():
    i = 0
    for row in db().select(db.charDefense.ALL):
        if(session.auth.user.username == row.title):
            form = SQLFORM(db.charDefense, db.charDefense(row.id))
            i = i + 1
    if(i > 0):
        if request.vars.title == session.auth.user.username:
            if form.process().accepted:
                response.flash = 'form accepted'
            elif form.errors:
                response.flash = 'form has errors'
            else:
                response.flash = 'out of range'
        else:
            response.flash = 'you cannot edit your username'
        return dict(form=form)
    else:
        return dict(form="Go to the create character tab")

def editCharAttack():
    i = 0
    for row in db().select(db.charAttack.ALL):
        if(session.auth.user.username == row.title):
            form = SQLFORM(db.charAttack, db.charAttack(row.id))
            i = i + 1
    if(i > 0):
        if request.vars.title == session.auth.user.username:
            if form.process().accepted:
                response.flash = 'form accepted'
            elif form.errors:
                response.flash = 'form has errors'
            else:
                response.flash = 'out of range'
        else:
            response.flash = 'you cannot edit your username'
        return dict(form=form)
    else:
        return dict(form="Go to the create character tab")

def editCharSkills():
    i = 0
    for row in db().select(db.charSkills.ALL):
        if(session.auth.user.username == row.title):
            form = SQLFORM(db.charSkills, db.charSkills(row.id))
            i = i + 1
    if(i > 0):
        if request.vars.title == session.auth.user.username:
            if form.process().accepted:
                response.flash = 'form accepted'
            elif form.errors:
                response.flash = 'form has errors'
            else:
                response.flash = 'out of range'
        else:
            response.flash = 'you cannot edit your username'
        return dict(form=form)
    else:
        return dict(form="Go to the create character tab")

def editCharFeats():
    i = 0
    for row in db().select(db.charFeats.ALL):
        if(session.auth.user.username == row.title):
            form = SQLFORM(db.charFeats, db.charFeats(row.id))
            i = i + 1
    if(i > 0):
        if request.vars.title == session.auth.user.username:
            if form.process().accepted:
                response.flash = 'form accepted'
            elif form.errors:
                response.flash = 'form has errors'
            else:
                response.flash = 'out of range'
        else:
            response.flash = 'you cannot edit your username'
        return dict(form=form)
    else:
        return dict(form="Go to the create character tab")

def editBoard():
    i = 1000
    for row in db().select(db.board.ALL):
        form = SQLFORM(db.board, db.board(row.id))
    for users in db().select(db.auth_user.id):
        if users.id < i:
            i = users.id
    if(i == session.auth.user.id):
        if form.process().accepted:
            response.flash = 'form accepted'
        elif form.errors:
            response.flash = 'form has errors'
        else:
            response.flash = 'out of range'
        return dict(form=form)
    else:
        return dict(form="")

def editNPC():
    i = 1000
    for users in db().select(db.auth_user.id):
        if users.id < i:
            i = users.id
    for row in db().select(db.npc.ALL):
        if(row.id > 0):
            form = SQLFORM(db.npc, db.npc(row.id))
    if(i == session.auth.user.id):
        if form.process().accepted:
            response.flash = 'form accepted'
        return dict(form=form)
    else:
        return dict(form="")

def editColor():
    i = 1000;
    for users in db().select(db.auth_user.id):
        if users.id < i:
            i = users.id
    for row in db().select(db.color.ALL):
        if(row.id > 0):
            form = SQLFORM(db.color, db.color(row.id))
    if(i == session.auth.user.id):
        if form.process().accepted:
            response.flash = 'form accepted'
        return dict(form=form)
    else:
        return dict(form="")
