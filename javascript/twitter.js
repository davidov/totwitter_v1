define([
  'jquery',
  'mousewheel',
  'images_loaded',
  'fancybox',
  'masonry',
  'browser_detect'
], function($) {
    JQTWEET ={
        user: "quenesstestacc",
        numberOfTweets: 20,
        appendTo: '.jstwitter',

        // Core function, load tweets
        loadTweets: function () {
            $.ajax({
                url: 'http://api.twitter.com/1/statuses/user_timeline.json/',
                type: 'GET',
                dataType: 'jsonp',
                data: {
                    screen_name: JQTWEET.user,
                    include_rts: true,
                    count: JQTWEET.numberOfTweets,
                    include_entities: true
                },
                success: function (data, textStatus, xhr) {
                    var i, img = '';

                    // Append the tweets into page
                    for (i = 0; i < data.length; i++) {
                        if (data[i].entities.media) {
                            if (data[i].entities.media.length) {
                                img = '<a href="' + data[i].entities.media[0].media_url + ':large" class="fancy" rel="group">';
                                img += '<img src="' + data[i].entities.media[0].media_url + ':thumb" alt="" width="150" />';
                                img += '</a>';
                            }
                        }
                        $(JQTWEET.appendTo).append(
                            JQTWEET.formatTweet(data[i], img)
                        );
                    }

                    //trigger jQuery Masonry once all data are loaded
                    var $container = $('#jstwitter');
                    $container.imagesLoaded(function(){
                      $container.masonry({
                        itemSelector : '.tweet',
                        columnWidth : 0,
                        isAnimated: true
                      });
                    });

                    //the last step, activate fancybox
                    $("a.fancy").fancybox({
                        'overlayShow'   : false,
                        'transitionIn'  : 'elastic',
                        'transitionOut' : 'elastic',
                        'overlayShow'   : true
                    });

                }
            });
        },

        formatTweet: function (data, img) {
            var html = '<div class="tweet">IMG_TAG TWEET_TEXT<div class="time">AGO</div>';

            html = html.replace('IMG_TAG', img)
                .replace('TWEET_TEXT', JQTWEET.ify.clean(data.text))
                .replace(/USER/g, data.user.screen_name)
                .replace('AGO', JQTWEET.timeAgo(data.created_at))
                .replace(/ID/g, data.id_str);

            return html;

        },

        /**
          * relative time calculator FROM TWITTER
          * @param {string} twitter date string returned from Twitter API
          * @return {string} relative time like "2 minutes ago"
          */

        timeAgo: function (dateString) {
            var rightNow = new Date(),
                then = new Date(dateString);

            if (BrowserDetect.browser == "Explorer") {
                // IE can't parse these crazy Rubi dates
                then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
            }

            var diff = rightNow - then,
                second = 1000, minute = 60 * second, hour = 60 * minute,
                day = 24 * hour, week = 7 * day;

            if (isNaN(diff) || diff < 0) {
                return ""; // return blank string if unknown
            }

            if (diff < second * 2) {
                // within 2 seconds
                return "right now";
            }

            if (diff < minute) {
                return (Math.floor(diff / second) + " seconds ago");
            }

            if (diff < minute * 2) {
                return "about a minute ago";
            }

            if (diff < hour) {
                return Math.floor(diff / minute) + " minutes ago";
            }

            if (diff < hour * 2) {
                return "about an hour ago";
            }

            if (diff < day) {
                return  Math.floor(diff / hour) + " hours ago";
            }

            if (diff > day && diff < day * 2) {
                return "yesterday";
            }
            if (diff < day * 365) {
                return Math.floor(diff / day) + " days ago";
            }  else {
                return "over a year ago";
            }

        },

        /**
          * The Twitalinkahashifyer!
          * http://www.dustindiaz.com/basement/ify.html
          * Eg:
          * ify.clean('your tweet text');
          */
             ify:  {
          link: function(tweet, hasIMG) {
            return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
              var http = m2.match(/w/) ? 'http://' : '';
              if (hasIMG) return '';
              else return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
            });
          },
          at: function(tweet) {
            return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function(m, username) {
              return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
            });
          },
          list: function(tweet) {
            return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function(m, userlist) {
              return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
            });
          },

          hash: function(tweet) {
            return tweet.replace(/(^|\s+)#(\w+)/gi, function(m, before, hash) {
              return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
            });
          },

          clean: function(tweet , hasIMG) {
              return this.hash(this.at(this.list(this.link(tweet, hasIMG))));
          }
        }
    };
});