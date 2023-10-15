import os 
from autogen import AssistantAgent, UserProxyAgent, config_list_from_json, config_list_from_models

from dotenv import load_dotenv
load_dotenv()

config_list = [
    {
        'model': 'gpt-4',
        'api_key': os.getenv("OPENAI_API_KEY"),
    },
    {
        'model': 'gpt-3.5-turbo',
        'api_key': os.getenv("OPENAI_API_KEY"),
    },
    {
        'model': 'gpt-3.5-turbo-16k',
        'api_key': os.getenv("OPENAI_API_KEY"),
    },
]

llm_config = {
    "seed": 42,
    "functions": [
        {
            "name": "python",
            "description": "run cell in ipython and return the execution result.",
            "parameters": {
                "type": "object",
                "properties": {
                    "cell": {
                        "type": "string",
                        "description": "Valid Python cell to execute.",
                    }
                },
                "required": ["cell"],
            },
        },
        {
            "name": "sh",
            "description": "run a shell script and return the execution result.",
            "parameters": {
                "type": "object",
                "properties": {
                    "script": {
                        "type": "string",
                        "description": "Valid shell script to execute.",
                    }
                },
                "required": ["script"],
            },
        },
    ],
    "config_list": config_list,
    "request_timeout": 600,
    "temperature":.5,
}

assistant = AssistantAgent(
    name="Assistant",
    llm_config=llm_config,
    system_message="Hi, I am your assistant. I can help you with your daily tasks."
)

user_proxy = UserProxyAgent(
    name="user_proxy",
    is_termination_msg=lambda x: x.get("content", "") and x.get("content", "").rstrip().endswith("TERMINATE"),
    human_input_mode="TERMINATE",
    max_consecutive_auto_reply=10,
    code_execution_config={"work_dir": "web"},
    llm_config=llm_config,
    system_message="""Reply TERMINATE if the task has been solved at full satisfation, 
    otherwise, reply CONTINUE or the reason why the task is not solved yet."""
)

task = """
give me a summary of this web site  https://scaledagileframework.com/
 """

user_proxy.initiate_chat(
    assistant, 
    message=task
    )
