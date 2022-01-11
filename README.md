# madcamp_pj2_backend
Submodule for [madcamp_pj2](https://github.com/woojinnn/madcamp_pj2). Responsible for backend stuffs.

---
## Development Envrionment
- Langauge
    - `Node.js`
        - `express` framework
    - `MongoDB`
        - `mongoose` ODM
- Insomnia for testing HTTP request
- Testing server spec:
    - Ubuntu 18.04.2 LTS
    - Kernel version:  
        Linux camp-20 4.15.0-166-generic #174-Ubuntu SMP Wed Dec 8 19:07:44 UTC 2021 x86_64 x86_64 x86_64 GNU/Linux
---
</br>

## Mongoose Schema
- Profile
    |Key|Type|Details|
    |------|---|---|
    |_id|Schema.Types.ObjectId|Obejct id|
    |userId|Number|userId from Kakao server (unique)|
    |name|String|user name|
    |imageUrl|String|user Profile url|
    |email|String|user email|
     </br> 
- Timeslot
    |Key|Type|Details|
    |------|---|---|
    |_id|Schema.Types.ObjectId|Obejct id|
    |start|Date|Start time (time slot size: 30 minutes)|
    |members`|[Schema.Types.ObjectId, ref: `Profile`]|Object Id of members that are available at this timeslot|
     </br> 
- Schedule
    |Key|Type|Details|
    |------|---|---|
    |_id|Schema.Types.ObjectId|Obejct id|
    |title|String|name of schedule|
    |days|[String]|days of this schedule </br> format: yyyy-mm-dd|
    |start_time|String|start time of day (format: hh-mm)|
    |end_time|String|end time of day (format: hh-mm)|
    |passwd|String|password required to enter schedule|
    |timeslots|[Schema.Types.ObjectId, ref: `Timeslot`]|timeslots related to this schedule </br> nubmer of timeslots: `((end_time - start_time)*2) * days`  </br> multiplies 2 since unit of each timeslot is 30 minutes while unit of start_time and end_time is 1 hour. |
    |members|[Schema.Types.ObjectId, ref: `Profile`]|list of whole members|

---
</br>

## API Specification
- Profile
    |HTTP|URI|Body Contents|Explanation|
    |----|---|-------------|-----------|
    |GET|/api/profiles/userId/:userId|None|Get single profile with user Id|
    |GET|/api/profiles/name/:name|None|Get profile by name|
    |POST|/api/profiles|userId, name, imageUrl, email|Create profile|
    |PUT|/api/profiles/:userId|userId, name, imageUrl, email|Update profile with user Id|
    |DELETE|/api/profiles/:userId|None|Delete profile|
- Schedule
    |HTTP|URI|Body Contents|Explanation|
    |----|---|-------------|-----------|
    |GET|/api/schedules|None|Get all schedules|
    |GET|/api/schedules/userId/:userId|None|Return list of schedules containing userId|
    |GET|/api/schedules/title/:title|None|Return list of schedules corresponding to the title|
    |GET|/api/timeslots/:timeslotId|None|Return timeslot corresponding to timeslotId|
    |GET|/api/schedules/scheduleId/:scheduleId|None|Return schedule corresponding to the scheduleId|
    |POST|/api/schedules|title, days, start_time, end_time, passwd|Create Schedule|
    |PUT|/api/schedules/:scheduleId|userId, contents: {[day, time, available]}|Update schedule corresponding to the scheduleId|
    |DELETE|/api/schedules/:scheduleId/:userId|None|When userId is -1, delete schedule of scheduleId</br>When userId isn't -1, delete member from schedule of scheduleId|