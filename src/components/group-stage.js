'use strict';

import React from 'react';

import UserTable from './user-table';
import ResultTable from './result-table';
import ScheduleTable from './schedule-table';

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
