require 'active_support'
require 'active_support/core_ext'
require 'active_support/inflector'
require 'erb'
require_relative './session'

class ControllerBase
  attr_reader :req, :res, :params

  def initialize(req, res, route_params = {})
    @req = req
    @res = res
    @route_params = route_params
    @already_built_response = false
    @params = req.params.merge(route_params)
  end

  def already_built_response?
    @already_built_response
  end

  def redirect_to(url)
    raise "cant do this twice" if @already_built_response
    @res['Location'] = url
    @res.status = 302
    @already_built_response = true
    session.store_session(res)
  end

  def render_content(content, content_type)
    raise "cant do this twice" if @already_built_response
    res['Content-Type'] = content_type
    res.body = [content]
    session.store_session(res)
    @already_built_response = true
  end

  def render(template_name)
    path = "views/#{self.class.to_s.underscore}/#{template_name}.html.erb"
    content = File.read(path)
    content = ERB.new(content).result(binding)
    render_content(content, 'text/html')
  end

  def session
    @session ||= Session.new(@req)
  end

  def invoke_action(name)
    self.send(name)
    render(name) unless already_built_response?
  end
end
