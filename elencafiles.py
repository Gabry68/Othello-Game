from flask import Flask, render_template_string, request, send_file
import os

app = Flask(__name__)

# Template HTML aggiornato per utilizzare CSS per l'indentazione
HTML_TEMPLATE = """
<!doctype html>
<html lang="it">
  <head>
    <meta charset="utf-8">
    <title>Seleziona File</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 40px; }
      .container { max-width: 1200px; margin: auto; }
      table { width: 100%; border-collapse: collapse; }
      th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
      th { background-color: #f2f2f2; }
      .button { margin-top: 20px; }
      .checkbox-center { text-align: center; }
      .file-name {
        display: inline-block;
        /* Indentazione basata sulla profondità */
        padding-left: calc(var(--depth) * 20px);
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Seleziona i file da includere</h1>
      <form method="post" action="/create">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Nome File</th>
              <th>Dimensione (bytes)</th>
              <th>Numero di Caratteri</th>
            </tr>
          </thead>
          <tbody>
            {% for file in files %}
              <tr>
                <td class="checkbox-center">
                  <input type="checkbox" name="selected_files" value="{{ file.relative_path }}">
                </td>
                <td>
                  <span class="file-name" style="--depth: {{ file.depth }};">{{ file.relative_path }}</span>
                </td>
                <td>{{ file.size }}</td>
                <td>{{ file.char_count }}</td>
              </tr>
            {% endfor %}
          </tbody>
        </table>
        <div class="button">
          <button type="submit">Crea File di Output</button>
        </div>
      </form>
    </div>
  </body>
</html>
"""

def get_all_files(root_dir, excluded_dirs=None, excluded_files=None):
    """
    Raccoglie tutti i file nella directory radice e nelle sottodirectory,
    escludendo specifiche cartelle e file.
    Restituisce una lista di dizionari con informazioni sui file.
    """
    if excluded_dirs is None:
        excluded_dirs = []
    if excluded_files is None:
        excluded_files = []

    files_info = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Escludi le directory specificate
        dirnames[:] = [d for d in dirnames if d not in excluded_dirs]

        # Calcola il percorso relativo per mostrare nella tabella
        rel_dir = os.path.relpath(dirpath, root_dir)
        # Determina la profondità della directory per l'indentazione
        if rel_dir == '.':
            depth = 0
        else:
            depth = rel_dir.count(os.sep) + 1  # +1 per il file stesso

        for filename in filenames:
            # Escludi i file specificati
            if filename in excluded_files:
                continue

            file_path = os.path.join(dirpath, filename)
            relative_path = os.path.relpath(file_path, root_dir).replace('\\', '/')

            try:
                size = os.path.getsize(file_path)
            except OSError as e:
                size = "N/A"
                print(f"Errore nel ottenere la dimensione del file {relative_path}: {e}")

            # Tentativo di leggere il file per contare i caratteri
            try:
                with open(file_path, 'r', encoding='utf-8') as file:
                    content = file.read()
                    char_count = len(content)
            except UnicodeDecodeError:
                try:
                    with open(file_path, 'r', encoding='latin-1') as file:
                        content = file.read()
                        char_count = len(content)
                except Exception as e:
                    char_count = "N/A"
                    print(f"Errore nella lettura del file {relative_path} con encoding latin-1: {e}")
            except Exception as e:
                char_count = "N/A"
                print(f"Errore nella lettura del file {relative_path}: {e}")

            files_info.append({
                'relative_path': relative_path,  # Percorso completo relativo
                'size': size,
                'char_count': char_count,
                'depth': depth  # Assicurati che sia un intero
            })

    print(f"Totale file raccolti: {len(files_info)}")
    for file in files_info:
        print(file)

    return files_info

@app.route('/')
def index():
    root_dir = '.'  # Directory radice (dove gira lo script)
    excluded_dirs = ['node_modules', '.next']  # Cartelle da escludere
    excluded_files = ['package-lock.json']  # File da escludere

    files_info = get_all_files(root_dir, excluded_dirs, excluded_files)
    # Ordina i file per percorso
    files_info.sort(key=lambda x: x['relative_path'])

    print("Rendering del template con i seguenti file:")
    for file in files_info:
        print(file)

    return render_template_string(HTML_TEMPLATE, files=files_info)

@app.route('/create', methods=['POST'])
def create_output():
    selected_files = request.form.getlist('selected_files')
    print(f"File selezionati: {selected_files}")

    if not selected_files:
        return "Nessun file selezionato.", 400

    output_content = ""
    for relative_path in selected_files:
        file_path = os.path.join('.', relative_path)
        print(f"Processando il file: {file_path}")

        if os.path.isfile(file_path):
            output_content += f"Nome del file: {relative_path}\n"
            output_content += "-" * 40 + "\n"
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
            except UnicodeDecodeError:
                try:
                    with open(file_path, 'r', encoding='latin-1') as f:
                        content = f.read()
                except Exception as e:
                    content = f"Errore nella lettura del file: {e}"
                    print(f"Errore nella lettura del file {relative_path} con encoding latin-1: {e}")
            except Exception as e:
                content = f"Errore nella lettura del file: {e}"
                print(f"Errore nella lettura del file {relative_path}: {e}")
            output_content += content + "\n\n"
            output_content += "-" * 80 + "\n\n"
        else:
            output_content += f"Il file {relative_path} non esiste o non è accessibile.\n\n"
            print(f"Il file {relative_path} non esiste o non è accessibile.")

    # Scrive il contenuto in un file di output
    output_filename = "output.txt"
    try:
        with open(output_filename, 'w', encoding='utf-8') as out_file:
            out_file.write(output_content)
        print(f"File di output creato: {output_filename}")
    except Exception as e:
        print(f"Errore nella scrittura del file di output: {e}")
        return f"Errore nella creazione del file di output: {e}", 500

    return send_file(output_filename, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
