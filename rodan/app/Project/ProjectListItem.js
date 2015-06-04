import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Events from '../Events';

class ProjectListItem extends Backbone.Model
{
    constructor(options)
    {
        this.defaults = {
            idAttribute: 'uuid'
        };
        super(options);
    }

    initialize(data)
    {
    }
}

export default ProjectListItem;