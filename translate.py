import os
import yaml

def load_translations(file_path):
    """Load translations from a YAML file."""
    with open(file_path, 'r', encoding='utf-8') as file:
        return yaml.safe_load(file)

def translate_html(template_path, translations, output_path):
    """Translate placeholders in the HTML template and save to output path."""
    with open(template_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace placeholders with translations
    for key, value in translations.items():
        placeholder = f'{{{{{key}}}}}' # Assuming placeholders are in the format {{key}}
        content = content.replace(placeholder, value)
    
    # Ensure output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Write the translated content to the output file
    with open(output_path, 'w', encoding='utf-8') as file:
        file.write(content)

def main():
    languages = ['en', 'zh']
    template_path = 'templates/index.html'
    js_template_path = 'templates/mine.js'
    
    for lang in languages:
        translation_file = f'templates/i18n/{lang}.yaml'
        translations = load_translations(translation_file)
        output_path = f'publish/{lang}/index.html'
        translate_html(template_path, translations, output_path)
        print(f'Translated content saved to {output_path}')

        output_path = f'publish/{lang}/js/mine.js'
        translate_html(js_template_path, translations, output_path)
        print(f'Translated content saved to {output_path}')

if __name__ == '__main__':
    main()
