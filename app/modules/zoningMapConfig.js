(function () {
    'use strict';

    angular.module('zoningMapApp').service('zoningMapConfig', function () {

        var cfg = {
          colors: {
            emo_1: '#556270',
            emo_2: '#4ecdc4',
            emo_3: '#c7f464',
            emo_4: '#ff6b6b',
            emo_5: '#c44d58',

            va_1: '#f2385a',
            va_2: '#f5a503',
            va_3: '#e9f1df',
            va_4: '#4ad9d9',
            va_5: '#3681bf',

            df_1: '#566669',
            df_2: '#bfe2ff',
            df_3: '#0a131a',
            df_4: '#122031',
            df_5: '#00010d',

            chart_blue: '#589ad0',
            chart_gray: '#cccccc',
            chart_gray_dark: '#aaaaaa',
            chart_green: '#8fca0e',
            chart_orange: '#ff7730',
            chart_purple: '#bf81bf',
            chart_red: '#f54d36',
            chart_white: '#fff',
            chart_yellow: '#ffc317',
            chart_pink: '#fb03b2',

            slate_blue_1: '#171C1C',
            slate_blue_2: '#0F181C',

            nav_bg: 'slate_blue_1',
            nav_txt: 'light',

            view_bg: 'light',
            view_txt: '#434649',

            accent_blue: 'va_5',

            patternDefault: ['#4D4D4D', '#5DA5DA', '#FAA43A', '#60BD68', '#F17CB0', '#B2912F', '#B276B2', '#DECF3F', '#F15854'],
            healthChart: ['#8fca0e', '#f54d36', '#ffc317', '#ff7730', '#3681bf', '#999999', '#d97bf9'],
            statusChart: ['#999999', '#d97bf9', '#f54d36', '#ff7730', '#8fca0e', '#ffc317', '#3681bf'],
            patternEmo: ['#556270', '#4ecdc4', '#c7f464', '#ff6b6b', '#c44d58'],
            patternVa: ['#f2385a', '#f5a503', '#e9f1df', '#4ad9d9', '#3681bf'],
            patternDf: ['#566669', '#bfe2ff', '#0a131a', '#122031', '#00010d'],
            patternD320: ['#1f77bf', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c', '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5', '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f', '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5']
          }
        }

        return cfg;
    });
})();
