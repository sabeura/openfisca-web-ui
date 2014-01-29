# -*- coding: utf-8 -*-


# OpenFisca -- A versatile microsimulation software
# By: OpenFisca Team <contact@openfisca.fr>
#
# Copyright (C) 2011, 2012, 2013, 2014 OpenFisca Team
# https://github.com/openfisca
#
# This file is part of OpenFisca.
#
# OpenFisca is free software; you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# OpenFisca is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.


"""Pages meta-data"""


import datetime

from korma.base import Button
from korma.choice import Select
from korma.condition import Condition
from korma.date import Date
from korma.group import Group
from korma.repeat import Repeat
from korma.text import Number, Text


bootstrap_control_inner_html_template = u'''
<label class="col-sm-6 control-label" for="{self.full_name}">{self.label}</label>
<div class="col-sm-6">
  {self.control_html}
</div>'''


bootstrap_group_outer_html_template = u'<div class="form-group">{self.inner_html}</div>'


def make_person(persons_choices):
    roles_choices = (u'Parent', u'Enfant')
    return Group(
        children_attributes = {
            '_control_attributes': {'class': u'form-control'},
            '_outer_html_template': bootstrap_group_outer_html_template,
            },
        javascript_module = u'person_modal',
        name = u'personne_in_famille',
        questions = [
            Select(
                choices = roles_choices,
                inner_html_template = bootstrap_control_inner_html_template,
                label = u'Rôle',
                ),
            Condition(
                base_question = Select(
                    choices = persons_choices,
                    label = u'Prénom',
                    ),
                conditional_questions = {
                    prenom: Group(
                        children_attributes = {
                            '_control_attributes': {'class': u'form-control'},
                            '_inner_html_template': bootstrap_control_inner_html_template,
                            '_outer_html_template': bootstrap_group_outer_html_template,
                            },
                        inner_html_template = u'''
<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
        <h4 class="modal-title" id="myModalLabel">{prenom}</h4>
      </div>
      <div class="modal-body">
        {{self[salaire].html}}
        {{self[prenom_text].html}}
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-primary" data-dismiss="modal">Valider</button>
      </div>
    </div>
  </div>
</div>
'''.format(prenom=prenom),
                        name = 'personne',
                        questions = [
                            Number(label = u'Salaire', min = 0, step = 1),
                            Text(label = u'Prénom', name = 'prenom_text'),
                            Date(label = u'Date de naissance', max = datetime.datetime.now().date()),
                            ],
                        )
                    for prenom in [u'Christophe']
                    },
                ),
            Button(
                control_attributes = {
                    'class': 'btn btn-primary',
                    'data-target': '#myModal',
                    'data-toggle': 'modal',
                },
                inner_html_template = bootstrap_control_inner_html_template,
                label = u'Éditer',
                outer_html_template = u'<div class="col-sm-offset-6 col-sm-10">{self.inner_html}</div>',
                ),
            ],
        )


pages_data = [
    {
        'name': 'famille',
        'slug': 'famille',
        'title': u'Famille',
        },
    {
        'name': 'declaration_impots',
        'slug': 'declaration-impots',
        'title': u'Déclaration d\'impôts',
        },
    {
        'name': 'logement_principal',
        'slug': 'logement-principal',
        'title': u'Logement principal',
        },
    ]


def page_form(ctx, page_name):
    assert ctx.session is not None
    korma_data = None if ctx.session.user is None else ctx.session.user.korma_data
    persons_choices = None if korma_data is None else persons_value_and_name(korma_data)
    if persons_choices is None:
        persons_choices = [u'Nouvelle personne']
    page_form_by_page_name = {
        'declaration_impots': Repeat(
            children_attributes = {
                '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=foy&idx={self.parent_data[declaration_impot_repeat][index]}"
class="btn btn-primary"> Plus de détails</a></div>''',
                },
            template_question = Group(
                children_attributes = {
                    '_outer_html_template': bootstrap_group_outer_html_template,
                    },
                name = 'declaration_impot',
                questions = [
                    Select(
                        choices = persons_choices,
                        control_attributes = {'class': 'form-control'},
                        inner_html_template = bootstrap_control_inner_html_template,
                        label = u'Vous',
                        ),
                    Select(
                        choices = persons_choices,
                        control_attributes = {'class': 'form-control'},
                        inner_html_template = bootstrap_control_inner_html_template,
                        label = u'Conj',
                        ),
                    Repeat(
                        template_question = Select(
                            choices = persons_choices,
                            control_attributes = {'class': 'form-control'},
                            label = u'Personne à charge',
                            inner_html_template = bootstrap_control_inner_html_template,
                            name = 'pac',
                            ),
                        ),
                    ]
                ),
            ),
        'famille': Repeat(
            name = u'familles',
            template_question = Repeat(
                name = u'personnes',
                outer_html_template = u'''
<div class="repeated-group">
  {self.inner_html}
  <a href="/all-questions?entity=fam&idx={self.parent_data[familles][index]}" class="btn btn-primary">
    Plus de détails
  </a>
</div>''',
                template_question = make_person(persons_choices=persons_choices),
                ),
            ),
        'logement_principal': Repeat(
            children_attributes = {
                '_outer_html_template': u'''<div class="repeated-group">{self.inner_html}
<a href="/all-questions?entity=men&idx={self.parent_data[logement_principal_repeat][index]}"
class="btn btn-primary">Plus de détails</a></div>''',
                },
            template_question = Group(
                outer_html_template = u'<div class="repeated-group">{self.inner_html}</div>',
                children_attributes = {
                    '_control_attributes': {'class': u'form-control'},
                    '_inner_html_template': bootstrap_control_inner_html_template,
                    '_outer_html_template': bootstrap_group_outer_html_template,
                    },
                name = 'logement_principal',
                questions = [
                    Select(
                        choices = [
                            u'Non renseigné',
                            u'Accédant à la propriété',
                            u'Propriétaire (non accédant) du logement',
                            u'Locataire d\'un logement HLM',
                            u'Locataire ou sous-locataire d\'un logement loué vide non-HLM',
                            u'Locataire ou sous-locataire d\'un logement loué meublé ou d\'une chambre d\'hôtel',
                            u'Logé gratuitement par des parents, des amis ou l\'employeur',
                            ],
                        label = u'Statut d\'occupation',
                        name = u'so',
                        ),
                    Number(label = u'Loyer'),
                    Text(label = u'Localité'),
                    ]
                ),
            ),
        }
    return page_form_by_page_name[page_name]


def persons_value_and_name(korma_data):
    return None if korma_data.get('personne', {}).get('personnes') is None else \
        [
            (unicode(idx), person['person_data'].get('name') or idx)
            for idx, person in enumerate(korma_data['personne']['personnes'])
            ]