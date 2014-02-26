/**
 * EditUser - Interface for editing a user
 * 
 * @author Blake Callens <blake@pencilblue.org>
 * @copyright PencilBlue 2014, All rights reserved
 */
function EditUser(){}

//dependencies
var Users = require('../users');

//inheritance
util.inherits(EditUser, pb.BaseController);

EditUser.prototype.render = function(cb) {
	var self = this;
	var get  = this.query;
    if(!get.id) {
        this.redirect(pb.config.siteRoot + '/admin/users/manage_users', cb);
        return;
    }
    
    var dao = new pb.DAO();
    dao.loadById(get.id, 'user', function(err, user) {
        if(util.isError(err) || user == null) {
            self.redirect(pb.config.siteRoot + '/admin/users/manage_users', cb);
            return;
        }

        delete user.password;
        pb.templates.load('admin/users/edit_user', null, null, function(data) {
            var result = ('' + data)
            	.split('^user_id^').join(user._id)
            	.split('^image_title^').join('^loc_USER_PHOTO^')
            	.split('^uploaded_image^').join((user.photo) ? user.photo : '');
            
            var tabs = [
                {
                    active: 'active',
                    href: '#account_info',
                    icon: 'cog',
                    title: '^loc_ACCOUNT_INFO^'
                },
                {
                    href: '#personal_info',
                    icon: 'user',
                    title: '^loc_PERSONAL_INFO^'
                }
            ];
            
            self.displayErrorOrSuccess(result, function(newResult) {
                result = newResult;
                
                var pills = Users.getPillNavOptions('edit_user');
                pills.unshift(
                {
                    name: 'manage_users',
                    title: user.username,
                    icon: 'chevron-left',
                    href: '/admin/users/manage_users'
                });
                
                result = result.concat(pb.js.getAngularController(
                {
                    navigation: pb.AdminNavigation.get(self.session, ['users']),
                    pills: pills,
                    tabs: tabs,
                    adminOptions: EditUser.getAdminOptions(self.session), 
                    user: user
                }));
                   
                var content = self.localizationService.localize(['admin', 'users', 'media'], result);
                cb({content: content});
            });
        });
    });
};

EditUser.getAdminOptions = function(session) {
    var adminOptions = [
        {name: localize([], '^loc_READER^'), value: ACCESS_USER},
        {name: localize([], '^loc_WRITER^'), value: ACCESS_WRITER},
        {name: localize([], '^loc_EDITOR^'), value: ACCESS_EDITOR}
    ];
    
    if(session.authentication.user.admin >= ACCESS_MANAGING_EDITOR) {
        adminOptions.push({name: localize([], '^loc_MANAGING_EDITOR^'), value: ACCESS_MANAGING_EDITOR});
    }
    if(session.authentication.user.admin >= ACCESS_ADMINISTRATOR) {
        adminOptions.push({name: localize([], '^loc_ADMINISTRATOR^'), value: ACCESS_ADMINISTRATOR});
    }
    
    return adminOptions;
};

//exports
module.exports = EditUser;
