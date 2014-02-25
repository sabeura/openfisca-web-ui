## -*- coding: utf-8 -*-


## OpenFisca -- A versatile microsimulation software
## By: OpenFisca Team <contact@openfisca.fr>
##
## Copyright (C) 2011, 2012, 2013, 2014 OpenFisca Team
## https://github.com/openfisca
##
## This file is part of OpenFisca.
##
## OpenFisca is free software; you can redistribute it and/or modify
## it under the terms of the GNU Affero General Public License as
## published by the Free Software Foundation, either version 3 of the
## License, or (at your option) any later version.
##
## OpenFisca is distributed in the hope that it will be useful,
## but WITHOUT ANY WARRANTY; without even the implied warranty of
## MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
## GNU Affero General Public License for more details.
##
## You should have received a copy of the GNU Affero General Public License
## along with this program.  If not, see <http://www.gnu.org/licenses/>.


<%!
from copy import copy

from biryani1 import strings

from openfisca_web_ui import urls, uuidhelpers
from openfisca_web_ui.templates import helpers
%>


<%def name="appconfig_script()" filter="trim">
define('appconfig', ${helpers.legislation_appconfig(ctx, legislation.get_api1_url(ctx, 'edit')) | n, js});
</%def>


<%def name="render_dated_legislation_node(node, editable = False, path = None)" filter="trim">
    % if node.get('@type') == 'Node':
        % for node_name in node['children']:
<%
            node_title = node['children'][node_name].get('description')
            node_slug = strings.slugify(node_title)
            node_path = copy(path) if path is not None else []
            node_path.append(node_name)
            if path is None:
                html_node_path = strings.slugify(node_path[-1])
            else:
                html_node_path = strings.slugify("-".join(node_path))
%>\
                        <p>
                            <a href="#" class="collapse-node-toggle collapsed" type="button" data-toggle="collapse" \
data-target="#${html_node_path}">
                                <span class="indicator"></span>
                                ${node_title}
                            </a>
                        </p>
                        <div id="${html_node_path}" class="collapse collapse-node">
                            ${self.render_dated_legislation_node(
                                node = node['children'][node_name],
                                editable = editable,
                                path = node_path,
                                )}
                        </div>
        % endfor
    % elif node.get('@type') == 'Scale':
        ${self.render_dated_legislation_scale(scale = node, editable = editable, path = path)}
    % elif node.get('@type') == 'Parameter':
        ${self.render_dated_legislation_parameter(parameter = node, editable = editable, path = path)}
    % endif
</%def>


<%def name="render_dated_legislation_scale(scale, editable = False, path = None)" filter="trim">
    <table class="table table-condensed">
        <thead>
            <tr>
                <th>Seuil</th>
                <th>Assiette</th>
                <th>Taux</th>
            </tr>
        </thead>
        <tbody>
    % for index, slice in enumerate(scale.get('slices')):
            <tr>
        % if editable is True:
                <td>
                    <a class="editable" data-name="${path | n, js, h}" data-index="${index}" \
data-element="threshold">${slice['threshold'] if slice.get('threshold') else ''}</a>
                </td>
                <td>
                    <a class="editable" data-name="${path | n, js, h}" data-index="${index}" \
data-element="base">${slice['base'] if slice.get('base') else ''}</a>
                </td>
                <td>
                    <a class="editable" data-name="${path | n, js, h}" data-index="${index}" \
data-element="rate">${slice['rate'] if slice.get('rate') else ''}</a>
                </td>
        % else:
                <td>${slice['threshold'] if slice.get('threshold') else ''}</td>
                <td>${slice['base'] if slice.get('base') else ''}</td>
                <td>${slice['rate'] if slice.get('rate') else ''}</td>
        % endif
            </tr>
    % endfor
        </tbody>
    </table>
</%def>


<%def name="render_dated_legislation_parameter(parameter, editable = False, path = None)" filter="trim">
    % if editable is True:
    <a class="editable" data-name="${path | n, js, h}" href="#">${parameter.get('value')}</a>
    % else:
    <div data-name="${path | n, js, h}">${parameter.get('value')}</div>
    % endif
</%def>


<%def name="render_legislation_node(node, path = None)" filter="trim">
    % if node.get('@type') == 'Node':
        % for node_name in node['children']:
<%
            node_title = node['children'][node_name].get('description')
            node_slug = strings.slugify(node_title)
            node_path = copy(path) if path is not None else []
            node_path.append(node_name)
            if path is None:
                html_node_path = strings.slugify(node_path[-1])
            else:
                html_node_path = strings.slugify("-".join(node_path))
%>\
                        <p>
                            <a href="#" class="collapse-node-toggle collapsed" type="button" data-toggle="collapse" \
data-target="#${html_node_path}">
                                <span class="indicator"></span>
                                ${node_title}
                            </a>
                        </p>
                        <div id="${html_node_path}" class="collapse collapse-node">
                            ${self.render_legislation_node(
                                node = node['children'][node_name],
                                path = node_path,
                                )}
                        </div>
        % endfor
    % elif node.get('@type') == 'Scale':
        <%self:render_legislation_scale scale="${node}"/>
    % elif node.get('@type') == 'Parameter':
        <%self:render_legislation_parameter parameter="${node['values']}"/>
    % endif
</%def>


<%def name="render_legislation_scale(scale)" filter="trim">
    <table class="table table-condensed">
        <thead>
            <tr>
                <th>Seuil</th>
                <th>Assiette</th>
                <th>Taux</th>
            </tr>
        </thead>
        <tbody>
    % for slice in scale.get('slices'):
            <tr>
                <td>${slice['threshold'][-1].get('value') if slice.get('threshold') else ''}</td>
                <td>${slice['base'][-1].get('value') if slice.get('base') else ''}</td>
                <td>${slice['rate'][-1].get('value') if slice.get('rate') else ''}</td>
            </tr>
    % endfor
        </tbody>
    </table>
</%def>


<%def name="render_legislation_parameter(parameter)" filter="trim">
    ${parameter[-1].get('value')}
</%def>
