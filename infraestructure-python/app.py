#!/usr/bin/env python3
import os

import aws_cdk as cdk

from infraestructure_python.infraestructure_python_stack import InfraestructurePythonStack
from infraestructure_python.webapp_stack import WebappStack
from infraestructure_python.api_stack import ApiStack




app = cdk.App()

webapp = WebappStack(app, 'webapp-py', env=cdk.Environment(region='us-east-2'))

api = ApiStack(app, 'api-py', env=cdk.Environment(region='us-east-2'))

app.synth()
