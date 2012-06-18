/**
 *
 * @version    0.1
 * @link       http://quidprogquo.com
 *
 * @author     Antonio Valverde @valgreens - antonio@valgreens.es
 */

(function ($, _) {
	
	/**
	*
	* Collections
	*
	*/

	var ItemsCollection = Backbone.Collection.extend({
		page: 1,
		url: function () {
			return 'http://api.blibb.net/ipedrazas/quid-prog-quo/'+this.page+'?callback=?';
		},
		parse: function (response) {
			this.number = response.blibb.num_items;
			this.tags = response.blibb.tags;
			return response.items;
		}
	});

	var TagItemsCollection = Backbone.Collection.extend({
		initialize: function(myTag) {
			this.tag = myTag;
		},
		url: function () {
			return 'http://api.blibb.net/ipedrazas/quid-prog-quo/tag/'+this.tag+'?callback=?';
		},
		parse: function (response) {
			return response.items;
		}
	});

	/**
	*
	* Views
	*
	*/

	var AppView = Backbone.View.extend({
		el: '#main',
		initialize: function() {
			$('#main').html('');
			$('#main').addClass('app');
			this.isLoading = false;
			this.items = new ItemsCollection();
			this.render();
		},
		render : function() {
			this.loadItems();
		},
		loadItems: function() {

			var that = this;
			this.isLoading = true;

			this.items.fetch({
				success: function (items) {
					if (that.items.page === 1) {
						$('.info-box').remove();
						$(that.el).before(_.template($('#infoboxWrapper').html()));
						var number = that.items.number;
						$('.info-box').append(_.template($('#numberProgs').html(), {number: number, _:_}));

						var tagList = that.items.tags;
						$('.nav-list').html('');
						$('.nav-list').append('<li class="nav-header">Tags</li>');
						$('.nav-list').append(_.template($('#taglist').html(), {tags: tagList, _:_}));

						new FormView();
						$(that.el).html('');
					}


					for(var i = 0, max = items.models.length; i < max; i += 2) {
						$(that.el).append(_.template($('#listItem').html(), {itemA: items.models[i], itemB: items.models[i+1], _:_}));
					}
					that.isLoading = false;
				},
				error: function(response) {
					console.error(response);
				}
			});
		},
		events: {
			'scroll': 'checkScroll'
		},
		checkScroll: function(event) {
			var triggerPoint = 100;
			if( !this.isLoading && this.el.scrollTop + this.el.clientHeight + triggerPoint > this.el.scrollHeight ) {
				this.items.page += 1;
				this.loadItems();
			}
		}

	});

	var FormView = Backbone.View.extend({
		el: '.info-box',
		initialize: function() {
			this.render();
		},
		render: function() {
			$(this.el).append(_.template($('#saveForm').html()));
		},
		events: {
			'click #saveProg': 'addProg'
		},
		addProg: function() {
			var twitter, skills, rate, github;
			twitter = $('#twitterIN').val();
			skills = $('#tagsIN').val();
			rate = $('#rateIN').val();
			github = $('#githubIN').val();

			$('#myModal').modal('hide');
			
			var box = {
				key: 'quidprogquo',
				app_token: 'quidprogquo',
				tags: skills,
				'3d-twitter': twitter,
                '01-github': github,
                '01-rate': rate
            };

			$.post("https://api.blibb.net/ipedrazas/quid-prog-quo", box, function(data) {

				$('#main').before(_.template($('#progAlert').html()));

			});

		}
	});

	var AboutView = Backbone.View.extend({
		el: '#main',
		initialize: function() {
			this.render();
		},
		render: function() {
			$('.info-box').remove();
			$('#main').removeClass('app');
			$(this.el).html(_.template($('#aboutTemplate').html()));
			new FormView({el: '.formButton'});
		}
	});

	var TeamView = Backbone.View.extend({
		el: '#main',
		initialize: function() {
			this.render();
		},
		render: function() {
			$('.info-box').remove();
			$('#main').removeClass('app');
			$(this.el).html(_.template($('#teamTemplate').html()));
		}
	});

	var TagView = Backbone.View.extend({
		el: '#main',
		initialize: function(tag) {
			$('#main').html('');
			$('#main').removeClass('app');
			this.myTag = tag;
			this.tags = new TagItemsCollection(this.myTag);
			this.render();
		},
		render: function() {
			
			var that = this;
			this.tags.fetch({
				success: function(items) {
					
					for(var i = 0, max = items.models.length; i < max; i += 2) {
						$(that.el).append(_.template($('#listItem').html(), {itemA: items.models[i], itemB: items.models[i+1], _:_}));
					}
				},
				error: function(response) {
					console.log(response);
				}
			});
		}


	});

	/**
	*
	* Routes
	*
	*/

	var AppRouter = Backbone.Router.extend({
		routes: {
			'home': 'getHome',
			'about': 'getAbout',
			'team': 'getTeam',
			'tag/:tag': 'getTag'
		},
		getHome: function() {
			return new AppView();
		},
		getAbout: function() {
			return new AboutView();
		},
		getTeam: function() {
			return new TeamView();
		},
		getTag: function(tag) {
			return new TagView(tag);
		}
	});

	/**
	*
	* Initialize app
	*
	*/

	var app_route = new AppRouter();
	Backbone.history.start();
	app_route.navigate("home", {trigger: true});

})(jQuery, _);
