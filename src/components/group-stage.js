'use strict';

import React from 'react';

import UserTable from './group-stage/user-table';
import ResultTable from './group-stage/result-table';
import ScheduleTable from './group-stage/schedule-table';

var GroupStage = React.createClass({
	render: function() {
		return (
			<div className="content">
				<ScheduleTable />
				<ResultTable />
				<UserTable />
			</div>
		);
	}

});

export default GroupStage;
