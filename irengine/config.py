from himl import ConfigProcessor

class Config():
    def __init__(self):
        self.config = {}

    def load_config(self, path="irconfig", output_format='yaml'):
        config_processor = ConfigProcessor()
        filters = () # can choose to output only specific keys
        exclude_keys = () # can choose to remove specific keys
        output_format = "yaml" # yaml/json

        print("Configuration:")
        print("-"*32)

        self.config = config_processor.process(
            path=path,
            filters=filters,
            exclude_keys=exclude_keys,
            output_format=output_format, print_data=True
            )

        print("-"*32)

        return self

    def get_config(self):
        return self.config