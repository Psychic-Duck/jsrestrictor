#
#  JavaScript Restrictor is a browser extension which increases level
#  of security, anonymity and privacy of the user while browsing the
#  internet.
#
#  Copyright (C) 2021  Martin Bednar
#
#  This program is free software: you can redistribute it and/or modify
#  it under the terms of the GNU General Public License as published by
#  the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program.  If not, see <https://www.gnu.org/licenses/>.
#

from values_tested import TestedValues
from web_browser_type import BrowserType


## Module contains definitions for expected values of default levels od JSR.
#
#  Expected values are comparing during testing with current values of variables.
#  'REAL VALUE' means that current value should not be spoofed.
#  'EXACTLY' means that current value should not be rounded
#       (the small deviation caused by the script runtime is neglected)
#  This module can be edited when definition of default levels will be changed.


## Expected values for default level 0 of JSR.
level0 = TestedValues(
    user_agent={BrowserType.FIREFOX: 'REAL VALUE',
                BrowserType.CHROME: 'REAL VALUE'},
    app_version='REAL VALUE',
    platform='REAL VALUE',
    vendor={BrowserType.FIREFOX: 'REAL VALUE',
            BrowserType.CHROME: 'REAL VALUE'},
    language='REAL VALUE',
    languages='REAL VALUE',
    do_not_track='REAL VALUE',
    cookie_enabled='REAL VALUE',
    oscpu='REAL VALUE',
    gps_accuracy={'value': 'REAL VALUE',
                  'accuracy': 'EXACTLY'},
    altitude={'value': 'REAL VALUE',
              'accuracy': 'EXACTLY'},
    altitude_accurac={'value': 'REAL VALUE',
                      'accuracy': 'EXACTLY'},
    heading={'value': 'REAL VALUE',
             'accuracy': 'EXACTLY'},
    latitude={'value': 'REAL VALUE',
              'accuracy': 'EXACTLY'},
    longitude={'value': 'REAL VALUE',
               'accuracy': 'EXACTLY'},
    speed={'value': 'REAL VALUE',
           'accuracy': 'EXACTLY'},
    timestamp={'value': 'REAL VALUE',
               'accuracy': 'EXACTLY'},
    device_memory={BrowserType.FIREFOX: 'REAL VALUE',
                   BrowserType.CHROME: 'REAL VALUE'},
    hardware_concurrency='REAL VALUE',
    IOdevices='REAL VALUE',
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 'EXACTLY'},
    performance={'value': 'REAL VALUE',
                 'accuracy': 'EXACTLY'},
    protect_canvas=False,
    methods_toString='REAL VALUE'
)

## Expected values for default level 1 of JSR.
level1 = TestedValues(
    user_agent={BrowserType.FIREFOX: 'REAL VALUE',
                BrowserType.CHROME: 'REAL VALUE'},
    app_version='REAL VALUE',
    platform='REAL VALUE',
    vendor={BrowserType.FIREFOX: 'REAL VALUE',
            BrowserType.CHROME: 'REAL VALUE'},
    language='REAL VALUE',
    languages='REAL VALUE',
    do_not_track='REAL VALUE',
    cookie_enabled='REAL VALUE',
    oscpu='REAL VALUE',
    gps_accuracy={'value': 'REAL VALUE',
                  'accuracy': 10},
    altitude={'value': 'REAL VALUE',
              'accuracy': 10},
    altitude_accurac={'value': 'REAL VALUE',
                      'accuracy': 10},
    heading={'value': 'REAL VALUE',
             'accuracy': 10},
    latitude={'value': 'REAL VALUE',
              # Use accuracy of hundreds of meters. It means maximally +- 0.01 degree from the real position. Look at: https://www.nhc.noaa.gov/gccalc.shtml
              'accuracy': 0.01},
    longitude={'value': 'REAL VALUE',
               # Use accuracy of hundreds of meters. It means maximally +- 0.01 degree from the real position. Look at: https://www.nhc.noaa.gov/gccalc.shtml
               'accuracy': 0.01},
    speed={'value': 'REAL VALUE',
           'accuracy': 10},
    timestamp={'value': 'REAL VALUE',
               'accuracy': 0.01},
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    IOdevices='REAL VALUE',
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 0.01},
    performance={'value': 'REAL VALUE',
                 'accuracy': 10},
    protect_canvas=False,
    methods_toString='REAL VALUE'
)

## Expected values for default level 2 of JSR.
level2 = TestedValues(
    user_agent={BrowserType.FIREFOX: 'REAL VALUE',
                BrowserType.CHROME: 'REAL VALUE'},
    app_version='REAL VALUE',
    platform='REAL VALUE',
    vendor={BrowserType.FIREFOX: 'REAL VALUE',
            BrowserType.CHROME: 'REAL VALUE'},
    language='REAL VALUE',
    languages='REAL VALUE',
    do_not_track='REAL VALUE',
    cookie_enabled='REAL VALUE',
    oscpu='REAL VALUE',
    gps_accuracy={'value': 'REAL VALUE',
                  'accuracy': 100},
    altitude={'value': 'REAL VALUE',
              'accuracy': 100},
    altitude_accurac={'value': 'REAL VALUE',
                      'accuracy': 100},
    heading={'value': 'REAL VALUE',
             'accuracy': 100},
    latitude={'value': 'REAL VALUE',
              # Use accuracy of kilometers. It means maximally +- 0.1 degree from the real position. Look at: https://www.nhc.noaa.gov/gccalc.shtml
              'accuracy': 0.1},
    longitude={'value': 'REAL VALUE',
               # Use accuracy of kilometers. It means maximally +- 0.1 degree from the real position. Look at: https://www.nhc.noaa.gov/gccalc.shtml
               'accuracy': 0.1},
    speed={'value': 'REAL VALUE',
           'accuracy': 100},
    timestamp={'value': 'REAL VALUE',
               'accuracy': 0.1},
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    IOdevices=0,
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 0.1},
    performance={'value': 'REAL VALUE',
                 'accuracy': 100},
    protect_canvas=True,
    methods_toString='REAL VALUE'
)

## Expected values for default level 3 of JSR.
level3 = TestedValues(
    user_agent={BrowserType.FIREFOX: 'REAL VALUE',
                BrowserType.CHROME: 'REAL VALUE'},
    app_version='REAL VALUE',
    platform='REAL VALUE',
    vendor={BrowserType.FIREFOX: 'REAL VALUE',
            BrowserType.CHROME: 'REAL VALUE'},
    language='REAL VALUE',
    languages='REAL VALUE',
    do_not_track='REAL VALUE',
    cookie_enabled='REAL VALUE',
    oscpu='REAL VALUE',
    gps_accuracy={'value': "null"},
    altitude={'value': "null"},
    altitude_accurac={'value': "null"},
    heading={'value': "null"},
    latitude={'value': "null"},
    longitude={'value': "null"},
    speed={'value': "null"},
    timestamp={'value': "null"},
    device_memory={BrowserType.FIREFOX: None,
                   BrowserType.CHROME: 4},
    hardware_concurrency=2,
    IOdevices=0,
    referrer='REAL VALUE',
    time={'value': 'REAL VALUE',
          'accuracy': 1.0},
    performance={'value': 'REAL VALUE',
                 'accuracy': 1},
    protect_canvas=True,
    methods_toString='REAL VALUE'
)
