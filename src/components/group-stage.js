'use strict';

import React from 'react';

import UserTable from './group-stage/user-table';
import ResultTable from './group-stage/result-table';
import ScheduleTable from './group-stage/schedule-table';

var GroupStage = React.createClass({
	render: function() {
		return (
			<div className="content">
				<section className="col-left">
					<ScheduleTable />
					<ResultTable />
				</section>
				<section className="col-right">
					<UserTable />

				</section>
			</div>
		);
	}

});

export default GroupStage;
